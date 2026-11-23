import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";

const { workflow, step, agent, ask, title, stop, pullRequests } = T3;

const OptionValue = Schema.Struct({ id: Schema.String, value: Schema.Union([Schema.String, Schema.Boolean]) });

const Input = Schema.Struct({
  map: Schema.String,
  ticket: Schema.String,
  stack: Schema.String,
  project: Schema.String,
  baseRef: Schema.String,
  conductor: Schema.String,
  brief: Schema.String,
  model: Schema.Struct({ instanceId: Schema.String, model: Schema.String, options: Schema.optional(Schema.Array(OptionValue)) }),
  runtimeMode: Schema.optional(Schema.Literals(["full-access", "auto", "auto-accept-edits", "approval-required"])),
  maxRounds: Schema.optional(Schema.Number),
});

const PullRequestHead = Schema.Struct({ url: Schema.String, head: Schema.String });

const LaneReport = Schema.Struct({
  state: Schema.Literals(["building", "approved", "needs_human", "done"]),
  prs: Schema.Array(PullRequestHead),
  summary: Schema.String,
  question: Schema.optional(Schema.String),
  choices: Schema.optional(Schema.Array(Schema.String)),
});

const reportRules = `

## Stack run

You run as the agent step of a T3 workflow run, a stack run. The run, not the conductor, wakes you. You are a top-level thread, so watch your own pull requests with \`watch_pull_request\` and end waiting turns without a result. Never merge and never ask for a merge word.

Whenever you stop for the run, submit your report with \`t3_submit_output\`:
- \`approved\`: every pull request of the stack passed the ready gate and is approved on its head. List each with its full head SHA.
- \`needs_human\`: you parked on the ticket and need the human. Put the one question in \`question\` and its answers in \`choices\`, your recommended answer first. Ask no question card.
- \`building\`: a pull request waits on checks you cannot watch. The run waits for them and wakes you.
- \`done\`: the stack is merged and rolled out, and the ticket is resolved.
`;

type StackInput = {
  map: string;
  ticket: string;
  stack: string;
  project: string;
  baseRef: string;
  conductor: string;
  brief: string;
  model: { instanceId: string; model: string; options?: { id: string; value: string | boolean }[] };
  runtimeMode?: string;
  maxRounds?: number;
};

const t3Bin = [`${homedir()}/.local/bin/t3`].find((path) => existsSync(path)) ?? "t3";

const send = (threadId: string, text: string) =>
  Effect.tryPromise(() => new Promise<void>((resolve, reject) => {
    const child = execFile(t3Bin, ["thread", "send", threadId, "-"], { timeout: 60_000 }, (error) => (error ? reject(error) : resolve()));
    child.stdin?.end(text);
  }));

const headsOf = (prs: ReadonlyArray<{ url: string; head: string }>) => prs.map((pr) => `${pr.url}@${pr.head}`).join(", ");

export default workflow(
  "wayfinder-stack",
  {
    version: 1,
    payload: Input,
    onEnd: (input: StackInput, end: { id: string; outcome: string; reason?: string }) => send(input.conductor, `stack-run ${input.stack} (${input.ticket}) run ${end.id}: ended ${end.outcome}${end.reason ? `: ${end.reason}` : ""}.`),
  },
  Effect.fn(function* (input: StackInput, run: { id: string }) {
    yield* title(`stack ${input.stack} (${input.ticket})`);
    const lead = `stack-run ${input.stack} (${input.ticket}) run ${run.id}`;
    const notify = (name: string, text: string) =>
      step(`notify/${name}`, { returns: Schema.Void, retry: { times: 3, schedule: Schedule.exponential("5 seconds") } }, send(input.conductor, `${lead}: ${text}`));
    const answerLine = (wait: string, choice: string) =>
      `This is a notice; only the human answers it. Once the human answers on your card and \`t3 workflow questions\` still lists this wait, send their answer: t3 workflow signal '{"choice":"${choice}","reason":"via conductor card: <the human's words>"}' --run ${run.id} --wait ${wait}`;

    const first = yield* agent("round/1", {
      project: input.project,
      title: `stack ${input.stack} (${input.ticket})`,
      model: input.model,
      runtimeMode: input.runtimeMode,
      workspace: { type: "worktree", baseRef: input.baseRef, startFromOrigin: true },
      timeout: "12 hours",
      quiet: "45 minutes",
      brief: input.brief + reportRules,
      returns: LaneReport,
    });
    const thread = first.thread;
    let report = first.value;

    for (let round = 2; round <= (input.maxRounds ?? 12); round++) {
      let brief: string;
      if (report.state === "done") return { stack: input.stack, prs: report.prs, summary: report.summary };

      if (report.state === "needs_human") {
        const wait = `question/${round}`;
        const question = report.question ?? report.summary;
        const choices = report.choices && report.choices.length >= 2 ? [...report.choices] : ["Yes", "No"];
        yield* notify(wait, `question ${wait}\n${question}\nChoices, recommended first: ${choices.join(" | ")}\n${answerLine(wait, choices[0]!)}`);
        const answer = yield* ask(wait, { title: `${input.stack}: ${question}`, choices, data: { ticket: input.ticket, prs: report.prs }, timeout: "7 days" });
        if (answer._tag === "None") return yield* stop(`no answer to ${wait} within 7 days`);
        brief = `The human answered "${question}": ${answer.value.choice}${answer.value.reason ? ` (${answer.value.reason})` : ""}. Record the decision on the ticket and go on.`;
      } else if (report.state === "building") {
        const standings = [];
        for (const [index, pr] of report.prs.entries()) {
          const standing = yield* pullRequests.wait(`checks/${round}/${index}`, { project: input.project, url: pr.url }, { until: "checks", timeout: "3 hours" });
          standings.push(`${pr.url}: ${standing._tag === "Some" ? `${standing.value.state}, checks ${standing.value.checks}` : "still pending after 3 hours"}`);
        }
        brief = `The checks settled:\n${standings.join("\n")}\nFix what failed, or go on to the ready gate, and report again.`;
      } else {
        const wait = `merge/${round}`;
        yield* notify(wait, `merge word ${wait} for ${headsOf(report.prs)}\n${report.summary}\n${answerLine(wait, "Merge")}`);
        const word = yield* ask(wait, { title: `${input.stack}: merge ${headsOf(report.prs)}?`, choices: ["Merge", "Hold"], data: { ticket: input.ticket, summary: report.summary }, timeout: "7 days" });
        if (word._tag === "None") return yield* stop(`no merge word for ${wait} within 7 days`);
        if (word.value.choice === "Hold") {
          brief = `The human held the merge${word.value.reason ? `: ${word.value.reason}` : ""}. Address it and report again.`;
        } else {
          yield* notify(`${wait}/given`, `the human gave the merge word for ${headsOf(report.prs)}${word.value.reason ? ` (${word.value.reason})` : ""}. Enqueue it per Merge step 3, unless you already did.`);
          const merged = [];
          for (const [index, pr] of report.prs.entries()) {
            const standing = yield* pullRequests.wait(`merged/${round}/${index}`, { project: input.project, url: pr.url }, { until: "merged", timeout: "2 days" });
            merged.push(`${pr.url}: ${standing._tag === "Some" ? standing.value.state : "not merged after 2 days"}`);
          }
          brief = `The merge settled:\n${merged.join("\n")}\nFor each merged pull request, run \`rollout\` from Deploy, then resolve the ticket and report done. For any other state, find why and report again.`;
        }
      }

      report = (yield* agent(`round/${round}`, { thread, brief, returns: LaneReport, timeout: "12 hours", quiet: "45 minutes" })).value;
    }
    return yield* stop(`more than ${input.maxRounds ?? 12} rounds`);
  }),
);
