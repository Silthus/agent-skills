# QA swarm panel

The panel is one brief per lens. Each reviewer works alone and never learns of
the others. Cast every lens with the model selection policy in the user's
agent instructions, when one exists; otherwise use the runtime defaults:

- **Review lane**, the policy's **Review** model for the change's author, or
  without a policy a strong model from the other model family: Correctness,
  Risk, Design, and Systems when the diff changes a shared boundary.
- **Fresh-eyes lane**, the policy's **fresh-eyes** model, or without a policy
  a strong model from the author's family: Fresh eyes, and UI when the diff
  changes a user interface, cast with the policy's UI defaults when it has
  them.
- **Team lane**, the Review lane's model: one lens per PostHog Review
  perspective of the area's owners and the author, see [Team](#team).

## Lanes

Every lens runs as a subagent of the current thread. Launch each lens with the
column for its model's family.

| Runtime     | GPT model                                                 | Claude model                                        |
| ----------- | --------------------------------------------------------- | --------------------------------------------------- |
| Claude Code | One foreground `Agent` per lens with `codex:codex-rescue`, when the Codex plugin provides it | One foreground `Agent` per lens with the selected Claude model |
| Codex       | One native subagent per lens                              | One `claude -p` per lens, in parallel, when the `claude` CLI is installed |

When the runtime cannot reach the other family, treat that family as an
outage, as described below.

Write each brief to a file next to the ledger. From Claude Code, dispatch
every lens of both lanes in one message. The `codex:codex-rescue` agent only
forwards its prompt to Codex, so give it the brief's path, not its text:

```text
--fresh --wait Read-only review. Read <brief file> and follow it.
```

From Codex, set `claude_review_model` to the selected Claude CLI model identifier and start each Claude lens read-only, from the repo root:

```sh
claude -p --model "$claude_review_model" --allowedTools "Read,Grep,Glob" < <brief file>
```

A lane fails when it ends without a `FINDINGS` block, when its `COVERED`
list misses a changed file, or when it runs longer than 30 minutes. Stop an
overdue lane before you go on. Rerun it once for the missing files. When it fails
again, run that brief on the strongest model you have and report the
substitution as a gap.

A 429 or a usage-limit error is an **outage**, not a lane failure: a rerun
hits the same limit. Skip that model family's lanes for the rest of the
swarm, both rounds. Run one lane on the strongest model you have, carrying
every lens of the missing family in one brief, and report the outage as a
gap.

## Repo knowledge

Before dispatch, collect the repository's own review material: review skills
such as `qa-team` with its incident patterns and personas, or
`security-audit`, and the security or review docs that the repo's agent docs
point to. This is the repo's memory of how it broke before. Each lens brief
carries the material for its hunting grounds, after the lens text: incident
patterns to Correctness and Risk, the security audit and security docs to
Risk, personas to Fresh eyes. The hunting grounds below stay the floor. Name
the material each lens received in the ledger.

## Brief

Every brief carries the same text and the full diff before its lens, so the
lanes share a prompt cache:

```md
You review a pull request. You did not write it. Review only: do not edit
files, commit, push, or post to GitHub.

Goal: <goal>
Base: origin/<base>. Head: <sha>. The diff is below.
Danger areas: <hunks>
PR description: <current body, without its merge-risk callout>
Owed proofs: <the owed kinds>
Evidence: <accessible capture links or proof paths, tested commits, and gaps>
Settled: <ledger entries that are fixed, rejected, or decided>. Raise one
again only when the code under it changed.

Read each changed hunk with its surrounding code, callers, and types before
you judge it. Report a finding only when you can name its concrete trigger and
its concrete consequence under intended use. When one cause breaks the same
rule at more than one site, report it once and list every site.

Style counts when it breaks a named standard: the repo's documented rules or
the coding preferences in the user's agent instructions. Taste without a standard is not a
finding.

End with:

FINDINGS:
- <file>:<line> | <blocker|major|minor|nit> | <lens> | <trigger> -> <consequence> | <fix> | sites: <file:line, ...>
(or "(none)")
COVERED: <every changed file you cleared or flagged>

You are done when every changed file is cleared or flagged against every
hunting ground of your lens.

<output of git diff origin/<base>...<sha>>

Lens: <lens name and hunting grounds>

<the repo knowledge for this lens, or nothing>
```

## Lenses

Every panel runs every lens. **UI** runs only when the diff changes a user
interface. **Systems** runs only when the diff changes a boundary that many
callers pass through: a shared helper, an executor, a serializer, a default
resolved in one place. In round two it runs when a round-one finding named the
same cause at more than one site. **Team** runs one lens per perspective of the
area's owners and the author.

### Fresh eyes

The fresh-eyes lane's second opinion on the whole change. Read it as a senior
engineer who sees it for the first time:

- Does the code do what the goal and the commits claim?
- Can a reviewer follow the resulting behavior from the PR description and
  its evidence? Check consequential claims against the observed results,
  capture scope, and freshness. Name inaccessible or missing proof as a gap.
- Anything that looks wrong in any area: logic, edge cases, error handling,
  races, names, structure, or tests.
- The part of the change you would ask the author about first.

### Correctness

Does the code do what the goal asks, for every input it will meet? Then assume
it is wrong and find how it breaks.

- Trace one concrete input through each new branch. Look for results that are
  wrong but silent.
- Boundaries: empty, single, huge, malformed, duplicate, and off-by-one inputs.
- Data mapping between layers, type coercions, and state mutations.
- Queries: join and filter conditions, aggregation, deterministic ordering,
  transaction boundaries.
- Async: a missing await, blocking work on an async path, races on shared
  state.
- Error paths: what the caller sees when each dependency fails.
- Goal fit: every part of the goal done, and no behaviour the goal does not
  ask for.
- Malformed, huge, empty, or malicious input.
- A slow dependency, or one that returns garbage.
- Concurrent requests and retries.
- Production volume.
- Old and new code running side by side during the deploy.
- The next developer who extends the code in the obvious, wrong way.

### Risk

Is the change safe against a hostile caller, and does it hold up at real scale
and through a deploy?

Security: a finding names the source, the sink, the missing control, an
exploit request, and why it is reachable. Drop a finding that misses one of
them.

- Access control on every method and action of a changed endpoint,
  permissions that allow by default, tenant scoping (IDOR), and mass
  assignment through writable fields.
- Injection: SQL in values and identifiers, shell, SSRF and open redirects,
  path traversal, XSS sinks, template injection, prompt injection that reaches
  a tool or an output sink.
- Secrets and personal data in code, logs, error reports, or URLs.
- Authentication: token checks, constant-time comparison, OAuth state and
  redirect checks, sessions on credential change, webhook signatures.
- Expensive work before authentication, and unbounded limits from the caller.
- CI and dependencies: `pull_request_target` with the PR head, loose pins,
  new install scripts.

Defense in depth, missing headers, or rate limits without an exploit chain are
not findings.

Production:

- Performance: N+1 queries, a missing index on a new filter, unbounded loads,
  memory that grows with the input, missing pagination, unbounded date ranges.
- Migrations: lock type and duration, a reversible path, old and new code
  running side by side during the deploy, deploy order.
- Contracts: changed request or response shapes, serialized formats read by
  other services, cached data written in the old format.
- Reliability: timeouts, retries without a cap, missing idempotency on side
  effects, swallowed errors, cache invalidation on every serving path,
  cleanup of resources.
- Rollout: risky behaviour behind a feature flag, safe behaviour when the flag
  is off, manual deploy steps.
- Observability: logs or metrics where data is dropped or limited, and enough
  signal to see the change fail in production.

Grade:

- Grade the diff with the `merge-risk` rubric from the hunks alone. End with a
  `GRADE: <low|medium|high> | <the hunk that sets it>` line after `COVERED`.
  The brief leaves out the author's callout, so the grade stays independent.
  In triage, a Risk grade above the callout's is a fix item, and the higher
  grade wins.
- Check the owed proofs against [`PROOF.md`](PROOF.md). A persisted input, a
  boundary format, or a high grade with no owed proof is a finding.

### Design

Is this the simplest code that meets the goal, and do the tests prove it?

- Simple design, in order: it passes the tests, reveals its intent, says each
  thing once, and has no superfluous parts.
- Removal first: every new branch, flag, fallback, alias, mode, or parameter
  that the goal does not need. The fix is to delete it.
- The coding preferences in the user's agent instructions, when they exist,
  such as names and small methods that explain the code instead of comments,
  type safety, and YAGNI.
- The smell baseline in step 3 of the `code-review` skill, and coupling:
  boolean parameters that make one function do two jobs, parallel arrays,
  circular dependencies.
- Naming: names that hide what a thing holds or does, negated booleans, stale
  copied names.
- Fit: the idioms, helpers, and patterns of the surrounding code.

Leave untouched lines alone, and leave short, clear code unextracted.

Tests:

- Behaviour through public seams, as the `tdd` skill defines them.
- A test for every behaviour the goal adds or changes, and for every fixed bug.
- Tautological tests, tests coupled to internals, mocks that differ from
  production, and smoke tests that prove nothing.
- Weakened or deleted assertions, skipped tests, and snapshots regenerated
  wholesale.
- Flaky constructs: real time, randomness, ordering, shared state between
  tests.
- Repeated test bodies that want one parameterized test.

### Systems

Does the change hold on every path through the boundary it touches, and does
the fix sit at the boundary or at one caller?

- Entry paths: list every way a call reaches the boundary, such as the UI, the
  API, MCP or other tools, imports, background jobs, retries, reruns, and
  resumed runs. Trace the change through each one. A path where the change does
  not hold is a finding.
- Shared cause: findings or bugs at more than one site that share one cause.
  Name the cause and the boundary it lives in, and test it against an
  alternative explanation.
- Fix placement: compare the local fix with the narrowest safe fix at the
  boundary. A local fix that leaves sibling callers broken is a finding.
- Callers the diff leaves unchanged: each one that now behaves differently
  through the boundary.

A finding here needs evidence in the code for the shared cause. Similar diffs
alone are not one.

### UI

Does the screen behave well for a real user?

- Loading, empty, and error states for every async action. An error state
  shows the real error.
- Visible feedback for every click, and a confirmation before a delete.
- Validation on the client and the server.
- Accessibility: labels, focus, and keyboard use, including IME composition
  before Enter submits.
- Overflow and truncation of dynamic text.
- Copy: clear, consistent wording for the same concept, and a permission
  error that names the missing permission.

### Team

The review perspectives of the people who own the code the PR touches, plus
the author's own. These are the `review-hog-perspective-*` skills in the
team's PostHog project. Select them before dispatch:

1. Collect the owners of the touched area. Match the changed paths against
   the repository's `CODEOWNERS` and expand each team with
   `gh api orgs/<org>/teams/<slug>/members --jq '.[].login'`. Add the
   maintainers: the five most frequent authors of the touched directories,
   `git log --since=1.year --format=%aN -- <dirs> | sort | uniq -c | sort -rn | head -5`.
2. List the perspectives on the PostHog MCP server with the `posthog-exec`
   tool: `call skill-list {"search": "review-hog-perspective-"}`. Switch to
   the team's project first, the one the user's agent instructions name, when
   the active project differs. An empty list from another project is not an
   empty lane.
3. Keep a perspective when one of its `owners` is the author, has a GitHub
   login in the owner set per `org-member-get-github-login`, or has a name in
   the maintainer set. A perspective with no owners is a canonical one and
   stays out: the other lanes already cover its ground.
4. `skill-get` each kept perspective and run it as its own lens with the
   shared brief, named after the perspective, with the perspective's body as
   the lens text. The brief already carries the harness rules.

Name the kept perspectives and the owners they matched in the panel brief.
When the PostHog MCP server is not available or nothing is kept, skip the
lane and write its gap line to the ledger before dispatch, naming the owners
it searched for.
