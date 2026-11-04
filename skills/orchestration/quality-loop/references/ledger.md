# Ledger

Both loops share one ledger directory. Every file is plain text, so a run reads it with `cat` and changes it with one edit.

## `limits.md`

The limits the ritual tunes. Each change gets one dated line that says why. Each run reads `Paused` first.

```md
Quality loop WIP: 2   # running lanes of this loop
Signal loop WIP: 2
Critical lanes: 1     # both loops together
Max changed production lines: 150
Max changed lines: 300
Paused: no

## Changes
- 2026-11-04: start values.
```

## `backlog.md`

The quality loop's ranked modules.

```md
| Rank | Module | Paths | Class | Stage | Score | Lane | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | <name> | `<glob>` | normal | cover | 42 | | <why it ranks here, or why it was skipped> |
```

## `hotpaths.md`

The dated score inputs per module are 90-day churn, the bug-fix share of commits, the production error weight, the latency weight, and the test gap. The **hot-path score** is churn × (bug-fix share + error weight + latency weight) × (1 + test gap).

## `signals.md`

Every signal the signal loop has seen, so no signal is handled twice.

```md
| ID | Source | First seen | Last seen | Problem | Code area | Class | Score | Status | Metric |
```

Status is one of `candidate`, `lane <id>`, `covered by <owner or link>`, `rejected: <reason>`, `needs decision`, or `fixed in <PR>`.

## `lanes.md`

Each lane has one row with its id, loop, row or signal, class, box, thread link, task id, PR, and state. The state is one of `planned`, `running`, `needs human`, `ready` (a critical lane waiting for the user), `ended`, or `settled`.

## `runs.jsonl`

One JSON line per settled lane and per coordinator run.

```json
{"id":"2026-11-05-q1","loop":"quality","kind":"lane","module":"<name>","stage":"cover","type":"test","class":"normal","pr":"<url>","lines":{"prod":0,"test":120},"proof":["base-green","head-green","mutation 61->78"],"review_rounds":2,"findings":{"real":1,"rejected":2},"stamp":"approved","merged":"<sha>","deploy":"ok","outcome":"merged","minutes":95,"lessons":["❌ <what did not work, and why>"]}
```

`outcome` is one of `merged`, `ready` (a critical lane's draft, waiting for the user), `stamp-refused`, `abandoned: <reason>`, `reverted`, or `no-op: <reason>`.
