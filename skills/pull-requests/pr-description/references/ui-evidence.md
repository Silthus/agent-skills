# UI evidence

## Capture during verification

1. List the changed user journey and the changed states and branches that
   affect its outcome, including empty, loading, error, and narrow-layout
   states. Pick the smallest set of scenarios that shows them.
2. Walk those scenarios before you request review, as the `ui-walk` proof
   in the `qa-swarm` skill's [`PROOF.md`](../../qa-swarm/PROOF.md#ui-walk)
   describes: on a seeded preview, in a browser signed in to it. Its
   screenshots are the PR captures.
3. Take a still of every changed feature, view, and state. Add a short
   recording of the main journey for a larger feature with several steps,
   or when the reader needs the action or its order to understand the
   result. In T3, record with `preview_recording_start` and
   `preview_recording_stop`; elsewhere use the `agent-browser` recording.
   When recording is impossible, name the missing video as a gap. The same
   captures serve verification and the PR. Add another format only when it
   shows something the others miss or the repository requires it. Full QA
   is a separate workflow, run when requested or required.
4. Use invented data. Inspect each capture: it shows the intended state and
   no private information. Check the whole frame before you publish. Keep
   the files and their run context outside source history: the tested
   commit, browser source, relevant flags, scenarios, results, and gaps.

Done when every consequential changed scenario has an observed result and
useful evidence, or a named verification gap. A gap stays unverified.

## Present the journey

Put captures in the order a user meets them, from entry to result. Caption
each with the action or state and the result it shows, such as "Selecting
Email opens provider setup." When flags and capture source apply to the
whole sequence, put them in one short context line.

Show before and after when the comparison explains the change. For a new
screen or flow, say there is no previous equivalent. When UI code changes
without a visible difference, say so in one line.

Use the recording for the main journey and stills for the other changed
branches. State what you exercised, and label behavior outside that scope
as unchecked.

## Upload media

Upload screenshots and recordings with the `--attach` flag of `gh pr create`,
`gh pr edit`, or `gh pr comment`. It needs `gh` 2.100.0 or newer; update an
older `gh` first.

`--attach` needs write access to the base repository. When it fails with
`attaching files requires write access to the repository`, as for a PR from
your fork into a protected repository:

- When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`),
  publish each screenshot to your own public fork and embed the returned URL:
  `fleet proof publish --repo <owner/repo> --pr <number> --commit <full SHA> --asset-repo <your public fork> <image>`.
  It publishes images only, not recordings.
- Otherwise, ask the user to drag the files into the PR description in the
  browser. Until they do, name the missing media as a gap.

Host media only through these routes, never in releases, gists, or other
branches or repositories.

To put each capture beside the behavior it proves, reference it in the body
by the path you pass to `--attach`. `gh` uploads the file and rewrites the
reference to the uploaded asset. `gh` appends an unreferenced attachment to
the end of the body, with the text after `#` as its alt text.

```sh
# body.md contains ![Before: <state>](/tmp/<pr>/before.png) and
# ![After: <state>](/tmp/<pr>/after.png) where they belong.
gh pr edit <number> --body-file body.md \
  --attach '/tmp/<pr>/before.png#Before: <state>' \
  --attach '/tmp/<pr>/after.png#After: <state>'
```

A video renders as an inline player and takes no alt text, so caption it in
the body text. When some uploads fail, `gh` still updates the PR and exits
with a non-zero status; run the command again. Open the PR and confirm that
each image renders and each video plays.

## Refresh after changes

After the last visual or behavioral change, rerun the scenarios it can
affect and replace their evidence. Reuse an unaffected capture once you
confirm its behavior and appearance still match. Record its tested commit
and why it still applies in the proof notes.

Order and keep evidence per the
[preservation rule](../SKILL.md#preserve-evidence). When fresh rendering is
blocked, label the older evidence and name the current verification gap
beside it.

Done when a reviewer can follow the changed journey without opening the
diff, each capture says what it shows, and no evidence implies a broader or
fresher verification than was performed.
