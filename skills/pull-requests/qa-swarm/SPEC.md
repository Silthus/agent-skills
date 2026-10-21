# Spec pass

Before a spec is published, one fresh reviewer reads the draft with the
[Anti-Overengineering lens](PANEL.md#anti-overengineering), so the plan is
lean before anyone builds it. Cast it on the Review lane for the spec's
author, per [`PANEL.md`](PANEL.md), and give it this brief:

```md
You review a draft spec. You did not write it. Review only: do not edit
files, publish the spec, or post anywhere.

Problem: <the spec's problem statement>
Repo: <path> at <sha>.

Read the spec whole. Read the code that its implementation decisions touch,
and the repo's manifests, lockfiles, and installed sources of the packages
it names. Run the lens on every concept the spec adds: each module,
interface, schema change, contract field, option, and dependency, and each
user story that asks for behavior the problem does not need. Where the lens
says diff, read the spec; where it says goal, read the problem; where it
says a PR in the stack, read a user story or ticket of this spec. This
brief's FINDINGS format wins.

Gates:
- Platform: the spec uses each framework and platform feature directly and
  in the way its docs intend.
- One model: each concept has one representation across the modules, the
  schema, and the contracts.
- Out of scope: the spec names what it leaves out on purpose, including each
  extension that its user stories or interfaces imply.

A rung finding names the rung, the replacement, and why the replacement
still solves the problem. A gate finding names the gate and the line the
spec lacks. A gate the spec fails without a written reason is a finding.

End with:

FINDINGS:
- <spec section> | <major|minor|nit> | Anti-Overengineering | <rung or gate>: <what the spec adds or lacks> -> <replacement or missing line, and why it still solves the problem> | <spec edit>
(or "(none)")
COVERED: <every spec section>

You are done when every concept the spec adds is kept or has a rung, and
every gate is passed or flagged.

Lens: <the Anti-Overengineering lens>

<the draft spec>
```

Triage each finding per [`TRIAGE.md`](TRIAGE.md), with the spec in place of
the diff. A Fix or Call item is an edit to the draft. A part that the
author or the user keeps against a finding keeps a one-line reason in the
spec's **Further Notes**, under **Complexity**. Every panel brief for code
that builds the spec carries those reasons on its `Kept by the spec:` line,
per [`PANEL.md`](PANEL.md#brief), and triage rejects a finding against
them per [`TRIAGE.md`](TRIAGE.md#design-findings). Keep the findings in a ledger file outside the
repository. The pass runs once, outside the round budget and `fleet proof`.

Done when every finding has a bucket, every Fix and Call edit is in the
draft, and the Decisions are written as one question for the user, with a
recommended answer for each.
