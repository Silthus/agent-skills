# QA swarm panel

The panel is one brief per lens. Each reviewer works alone and never learns of
the others. Cast each lane with the model selection policy in the user's
agent instructions, or with the runtime defaults when there is no policy:

- **Review lane**: the policy's **Review** model for the change's author, or
  a strong model from the other family. It runs Correctness, Risk, Design,
  Anti-Overengineering, and Systems.
- **Fresh-eyes lane**: the policy's **fresh-eyes** model, or a strong model
  from the author's family. It runs Fresh eyes and UI, with UI cast by the
  policy's UI defaults when it has them.
- **Team lane**: the Review lane's model. It runs one lens per PostHog Review
  perspective of the area's owners and the author, see [Team](#team).

## Lanes

Every lens runs as a subagent of the current thread. Launch each lens with the
column for its model's family.

| Runtime     | GPT model                                                 | Claude model                                        |
| ----------- | --------------------------------------------------------- | --------------------------------------------------- |
| Claude Code | One foreground `Agent` per lens with `codex:codex-rescue`, when the Codex plugin provides it | One foreground `Agent` per lens with the selected Claude model |
| Codex       | One native subagent per lens                              | One `claude -p` per lens, in parallel, when the `claude` CLI is installed |

When the runtime cannot reach the other family, treat that family as an
outage.

Write each brief to a file next to the ledger. From Claude Code, dispatch
every lens of both lanes in one message. The `codex:codex-rescue` agent only
forwards its prompt to Codex, so give it the brief's path, not its text:

```text
--fresh --wait Read-only review. Read <brief file> and follow it.
```

From Codex, set `claude_review_model` to the selected Claude CLI model
identifier and start each Claude lens read-only, from the repo root:

```sh
claude -p --model "$claude_review_model" --allowedTools "Read,Grep,Glob" < <brief file>
```

A lane fails when it ends without a `FINDINGS` block, when its `COVERED`
list misses a changed file, or when it runs longer than 30 minutes. Stop an
overdue lane. Rerun a failed lane once for the files it did not cover. When
it fails again, run that brief on the strongest model you have and report the
substitution as a gap.

A 429 or a usage-limit error is an **outage**, not a lane failure, because a
rerun hits the same limit. Skip that family's lanes for the rest of the swarm,
both rounds. Run one lane on the strongest model you have, with every lens of
the missing family in one brief, and report the outage as a gap.

## Repo knowledge

Before dispatch, collect the repository's own review material, its memory of
how it broke before: review skills such as `qa-team` with its incident
patterns and personas, or `security-audit`, and the security or review docs
that the repo's agent docs point to. Each brief carries the material for its
lens after the lens text: incident patterns to Correctness and Risk, the
security audit and security docs to Risk, personas to Fresh eyes. The hunting
grounds below stay the floor. Name in the ledger the material each lens
received.

## Brief

Every brief carries the same text and the full diff first, so the lanes share
a prompt cache. The Design and Anti-Overengineering lenses get no Context
block: they judge the design from the goal and the code alone, so the author's
framing cannot settle it.

```md
You review a pull request. You did not write it. Review only: do not edit
files, commit, push, or post to GitHub.

Goal: <goal>
Stack: <the PRs below this one, or none>
Base: origin/<base>. Head: <sha>. The diff is below.

Read the changed files whole. Open another file only to follow a symbol that
a changed hunk defines, calls, or changes: to its definition, its callers, and
its types. Design and Anti-Overengineering may also search for a module that
already owns a concept the diff adds, Anti-Overengineering reads the
manifests, lockfiles, and installed sources of the packages the diff uses,
and Systems traces
callers up to their entry paths. Report a
finding only when you can name its concrete trigger and its concrete
consequence under intended use. A Design finding names, in
place of a trigger and a consequence, the concepts that exist now and the
concepts the restructuring deletes. An Anti-Overengineering finding names
the rung and the replacement, and why the replacement still meets the goal.
When one cause breaks the same rule at
more than one site, report it once and list every site.

Style counts only when it breaks a named standard: the repo's documented rules
or the coding preferences in the user's agent instructions. Structure is not
style.

End with:

FINDINGS:
- <file>:<line> | <blocker|major|minor|nit> | <lens> | <trigger> -> <consequence> | <fix> | sites: <file:line, ...>
- Design form: <file>:<line> | <severity> | Design | <concepts now> -> deletes <concepts> | <restructuring> | sites: <file:line, ...>
- Anti-Overengineering form: <file>:<line> | <severity> | Anti-Overengineering | <rung>: <what the diff builds> -> <replacement, and why it still meets the goal> | <cut> | sites: <file:line, ...>
(or "(none)")
COVERED: <every changed file you cleared or flagged>

You are done when every changed file is cleared or flagged against every
hunting ground of your lens.

<output of git diff origin/<base>...<sha>>

Settled: <ledger entries that are fixed, rejected, or decided>. Raise one
again only when the code under it changed.
Kept by the spec: <each Complexity reason of the spec the change builds, or
none>. Raise a finding that cuts, replaces, or narrows a kept part only
against what the code builds beyond the reason. Report a bug in a kept part
as usual.

Context (every lens except Design and Anti-Overengineering):
Approach: <approach, or none>
Danger areas: <hunks>
PR description: <current body, without its merge-risk callout>
Owed proofs: <the owed kinds>
Evidence: <accessible capture links or proof paths, tested commits, and gaps>

Lens: <lens name and hunting grounds>

<the repo knowledge for this lens, or nothing>
```

## Design pass

Before a PR opens, one reviewer reads the branch with the Design and
Anti-Overengineering lenses, so the design is settled before a person reads
it. Cast it on the Review lane and
give it the brief above for the branch diff against the base, with no Context
block. Triage each finding per [`TRIAGE.md`](TRIAGE.md), fix the Fix and Call
items, and keep the findings in a ledger file outside the repository. When
the PR opens, copy them into its ledger, so the first review sees them as
settled. The pass runs once, before and outside the round budget and
`fleet proof`; the review that follows reads its fixes. Done when every
finding has a bucket and every Fix and Call item is committed.

## Lenses

Round one runs every lens. UI and Systems run only when their trigger holds.
**UI** runs when the diff changes a user interface. **Systems** runs when the
diff changes a boundary that many callers pass through: a shared helper, an
executor, a serializer, a default resolved in one place. In round two,
Systems runs when a round-one finding named the same cause at more than one
site. **Team** runs one lens per perspective of the area's owners and the
author.

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
- Boundaries: empty, single, huge, malformed, malicious, duplicate, and
  off-by-one inputs.
- Data mapping between layers, type coercions, and state mutations.
- Queries: join and filter conditions, aggregation, deterministic ordering,
  transaction boundaries.
- Async and concurrency: a missing await, blocking work on an async path,
  races on shared state, concurrent requests, and retries.
- Error paths: what the caller sees when each dependency fails, is slow, or
  returns garbage.
- Goal fit: every part of the goal done, and no behavior the goal does not
  ask for.
- Production volume.
- Old and new code running side by side during the deploy.
- The next developer who extends the code in the obvious, wrong way.

### Risk

Is the change safe against a hostile caller, and does it hold up at real scale
and through a deploy?

Security: a finding names the source, the sink, the missing control, an
exploit request, and why it is reachable. Drop a finding that misses one of
them. Also drop these findings: defense in depth, a missing header, and a
rate limit without an exploit chain.

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
- Rollout: risky behavior behind a feature flag, safe behavior when the flag
  is off, manual deploy steps.
- Observability: logs or metrics where data is dropped or limited, and enough
  signal to see the change fail in production.

Grade:

- Grade the diff with the `merge-risk` rubric from the hunks alone. End with a
  `GRADE: <low|medium|high> | <the hunk that sets it>` line after `COVERED`.
- Check the owed proofs against [`PROOF.md`](PROOF.md). A persisted input, a
  boundary format, or a high grade with no owed proof is a finding.

### Design

Is there a **code judo** move: a restructuring that keeps the goal's behavior
and makes whole branches, helpers, modes, parameters, or layers disappear?
Find the move, or show with your sketch that none exists.

Before you judge the diff's design, sketch the smallest design that delivers
the goal from the base code, in at most ten lines: the data it adds, the one
place its logic lives, and the contracts it touches. Then compare the diff
with your sketch. Each concept the diff has and your sketch lacks must earn
its place. End with the sketch as a `SKETCH:` block after `COVERED`.

- **Data over code**: a callback, hook, or generic mechanism that hides a
  simple data fact, such as which URL parameter a page reads. Declare the fact
  and build the behavior once.
- **Canonical layer**: feature logic in a shared path.
- **Boundaries**: optional parameters, boolean or nullable modes, `any`, and
  casts that let one function serve callers with different needs. Two needs
  are two contracts.
- **Spaghetti growth**: special cases bolted onto an existing flow, and
  repeated conditionals on one concept that signal a missing model.
- **Size**: a file the diff pushes from under 1000 lines to over 1000 lines.
- The coding preferences in the user's agent instructions, when they exist,
  such as type safety and names and small methods that explain the code
  instead of comments.
- The smell baseline in step 3 of the `code-review` skill, and coupling:
  parallel arrays and circular dependencies.
- Naming: names that hide what a thing holds or does, negated booleans, stale
  copied names.

Restructure the code the diff adds and the modules that own the concepts it
touches, and leave unrelated code as it is. Prefer the move that deletes a
concept to the move that relocates it. Grade a finding by what it deletes:
a contract, a concept, or a layer is `major`, and a helper or a branch is
`minor`. Rank findings by how much they delete.

Tests:

- Behavior through public seams, as the `tdd` skill defines them.
- A test for every behavior the goal adds or changes, and for every fixed bug.
- Tautological tests, tests coupled to internals, mocks that differ from
  production, and smoke tests that prove nothing.
- Weakened or deleted assertions, skipped tests, and snapshots regenerated
  wholesale.
- Flaky constructs: real time, randomness, ordering, shared state between
  tests.
- Repeated test bodies that want one parameterized test.

### Anti-Overengineering

Does the change build something that the goal does not need, or that the
codebase, the platform, or an installed dependency already provides, and does
it use each tool the way the tool intends?

For each concept the diff adds, such as a function, a type, a module, a
parameter, an option, a fallback, or a dependency, climb the ladder. Stop at
the first rung that meets the goal; the rung names the finding. A concept
that the goal needs and no rung replaces is **kept**, with no finding.

1. **delete**: the goal works without it. This covers every new branch, flag,
   fallback, alias, mode, parameter, or contract field that the goal does not
   need, including one that serves a consumer no PR in the stack adds.
2. **reuse**: a module of this repo already does it. Use it the way the
   surrounding code does, with its idioms, helpers, and patterns. This
   covers logic that re-derives a concept another module owns, such as a
   second parsing rule beside the parser. A house component beats a native
   widget.
3. **native**: the language's standard library, the runtime, the framework,
   or the platform does it at the version the repo pins, such as a browser
   API, a database constraint, or a CI feature. Read the version in the
   manifest or lockfile. Code
   that works around the tool's own mechanism belongs here too, such as a
   manual cache beside the framework's cache, or a hand-written retry loop
   where the client has a retry option.
4. **existing-dep**: an installed dependency does it. A new dependency that
   replaces a few lines is a **delete** finding.
5. **shrink**: less code says the same at a glance. This covers thin
   wrappers, pass-through helpers, identity abstractions, and extension
   points with one caller or one implementation.

Each finding cites its replacement: the file and line for **reuse**, and for
**native** and **existing-dep** the installed source, type definitions, or
changelog of the pinned version, or its docs page when you can open the web.
Without a citation, mark the finding `unverified: <API>` so triage checks it.
A
replacement must read at a glance and keep one concept per name; a dense
one-liner that a reader must decode is a longer read, not a shorter one.
Keep, at full strength, validation at a trust boundary, error handling that
prevents data loss, security controls, accessibility, and everything the
goal asks for.

Grade a finding by what the cut removes: a dependency, a contract, or a
layer is `major`, a helper, a branch, or a parameter is `minor`, and lines
alone are a `nit`. Rank findings by that payoff.

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
alone are not evidence.

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
   tool: `call skill-list {"search": "review-hog-perspective-"}`. When the
   active project differs from the team's project that the user's agent
   instructions name, switch to it first. An empty list from another project
   is not an empty lane.
3. Keep a perspective when one of its `owners` is the author, has a GitHub
   login in the owner set per `org-member-get-github-login`, or has a name in
   the maintainer set. A perspective with no owners is a canonical one and
   stays out, because the other lanes already cover its ground.
4. `skill-get` each kept perspective and run it as its own lens with the
   shared brief, named after the perspective, with the perspective's body as
   the lens text. The brief already carries the harness rules.

Name the kept perspectives and the owners they matched in the panel brief.
When the PostHog MCP server is not available or nothing is kept, skip the
lane and, before dispatch, write its gap line to the ledger, naming the owners
it searched for.
