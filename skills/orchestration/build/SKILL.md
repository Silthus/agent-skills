---
name: build
description: Size and run new work that changes code, docs, or config, from a one-line fix to a project of many pull requests. Use at the start of every task that builds, fixes, or changes something, and when running work outgrows its size.
---

# Build

Take a request to shipped work at the smallest size that holds it. The **judge** picks the size, and you read only that size's file.

## Judge

Read the request, the thread so far, and the code it touches. Take the first size whose test holds:

| Size | Test | Path |
| --- | --- | --- |
| `none` | A question, a status check, a lookup, an explanation, or a review of someone else's work. Also more work inside an open pull request or a lane that another skill started, such as a review fix, a map ticket, or a loop lane: that skill carries it. A running build judges again instead. | Answer it, or go on with that skill. The build ends. |
| `one-off` | One session finishes it in one pull request of at most about 400 changed production lines, or in a change with no pull request, and the human has no decision to make first. | [ONE-OFF.md](ONE-OFF.md) |
| `issue` | Bigger than a one-off, such as a second pull request, more than about 400 production lines, or a decision the human must make before the code, and still one stack of at most 3 pull requests in one repository with a clear destination. | [ISSUE.md](ISSUE.md) |
| `map` | More than 3 pull requests, several repositories, or a destination still in fog: you cannot yet list the decisions. | [MAP.md](MAP.md) |

Then add each **first step** whose test holds. A first step other than `research` makes the size at least `issue`.

- `research`: a fact outside this repository decides the shape, such as a third-party API, a price, or a limit.
- `prototype`: how it looks or behaves is open, such as a layout or a state model the human should see first.
- `architecture`: it changes a contract between modules, the data model, or caching.

When two sizes fit, take the smaller one: judging again catches growth.

Done when, for every size but `none`, you said the **verdict line** to the human before the first change: `Build: issue + research. <one reason>.`

## Judge again

Judge again when the work outgrows its size's test: a one-off passes about 400 production lines, needs a second pull request, or meets a decision for the human; an issue needs a fourth pull request or a second stack; any build reaches another repository; or the human adds scope. Say the new verdict line, read the new size's file, and carry the work you have: a one-off becomes the first slice of the issue, and an issue becomes the destination of the map. A running build only grows; when scope shrinks, finish at the current size.

## Start

Right after the verdict line, before any first step or change of a one-off or an issue, run the `impact` skill when it is installed: its **Worth** check first for a bug fix or a performance change, then its **Start** decision. A park ends the build with its park line. A map runs **Start** for its proposal question in [MAP.md](MAP.md), and the rest of `impact` while it charts.
