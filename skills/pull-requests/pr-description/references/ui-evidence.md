# UI evidence

Use this reference when verifying a UI change for a PR, writing its evidence,
or refreshing evidence after a fix or rebase.

## Capture during verification

1. Identify the changed user journey and its consequential changed states or
   branches. Choose the smallest set of scenarios that demonstrates them.
   Include changed empty, loading, error, or narrow-layout states where they
   affect the outcome. Every changed feature, view, and state gets a
   screenshot.
2. Exercise those scenarios before requesting review. Reuse the verification
   session for PR captures. Use the runtime's native browser tools. In T3,
   start with `preview_status` and open the preview when none is attached.
   Use another browser only when the native tools are absent or explicitly
   unavailable, or the user requests it.
3. Capture the running app when the claim involves an integration or saved
   result. A Storybook or mock capture can demonstrate appearance; label its
   source and verify backend behavior separately when claiming it works.
4. Use a still for every changed view and state. Add a short recording of
   the main journey for a larger feature with several steps, or when the
   action or order is needed to understand the result. In T3, record with
   `preview_recording_start` and `preview_recording_stop`; elsewhere use the
   `agent-browser` recording. When recording is impossible, name the missing
   video as a gap. Reuse either format for verification and the PR. Produce additional formats only when they
   show something missing or the repository requires them. Full QA remains
   a separate workflow when requested or required.
5. Inspect the captured files. Use invented data and check the whole visible
   frame for private information before publication. Keep files and run
   context outside source history: tested commit, browser source, relevant
   flags, scenarios, results, and gaps.

Done when every consequential changed scenario has an observed result and
useful evidence, or a named verification gap. A gap remains unverified.

## Present the journey

Put captures in the order a user encounters them, from entry to result.
Caption each with the action or state and the result it demonstrates, such
as "Selecting Email opens provider setup." Group flags and capture source
in one short context line when they apply to the whole sequence.

Show before and after when the comparison explains the change. For a new
screen or flow, say there is no previous equivalent. When UI code changes
without a visible difference, state that in one line.

Show the main journey in a recording when it needs one, and use stills for
the remaining changed branches. State what was actually exercised. Describe
behavior outside the tested scope as unchecked.

## Upload media

Upload screenshots and recordings with the `--attach` flag of `gh pr create`,
`gh pr edit`, or `gh pr comment`. It needs `gh` 2.100.0 or newer; update an
older `gh` first. Do not use releases or gists to host media.

`--attach` needs write access to the base repository. When it fails with
`attaching files requires write access to the repository`, as for a PR from
your fork into a protected repository:

- When the `fleet` CLI is available (on `PATH` or at `~/dev/fleet/fleet`), publish each screenshot to your own
  public fork and embed the returned URL:
  `fleet proof publish --repo <owner/repo> --pr <number> --commit <full SHA> --asset-repo <your public fork> <image>`.
  It publishes images only, not recordings.
- Otherwise, ask the user to drag the files into the PR description in the
  browser. Until they do, name the missing media as a gap.

Do not use other branches or repositories.

Put each capture beside the behavior it proves: reference it in the body by
the same path that you give to `--attach`. `gh` uploads the file and rewrites
the reference to the uploaded asset. An attachment without a reference is
appended to the end of the body, with the alt text after `#`.

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

After the last relevant visual or behavioral change, rerun the affected
scenarios and replace their evidence. Reuse unaffected captures after
checking that their behavior and appearance still match; record their tested
commit and why they remain applicable in the proof notes. Limit rechecks to
the scenarios the change can affect.

Present evidence applicable to the current code first. Follow the
[preservation rule](../SKILL.md#preserve-evidence) for older media. If fresh rendering is blocked,
label the older evidence and the current verification gap beside it.

Done when a reviewer can follow the changed journey without opening the
diff, each capture says what it demonstrates, and no evidence implies a
broader or fresher verification than was performed.
