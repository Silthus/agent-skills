# Build: one-off

A **one-off** is one change that one session finishes. The verdict line and the Start line are its plan. Ask no plan question, unless the user's agent instructions ask for one.

1. With `research`, read the source first and cite it in the pull request.
2. Build the change test-first when it changes behavior.
3. When it ends in a pull request, run the `full-stop` skill. Unless the user's agent instructions ask for a plan question, answer each item of its kickoff intake with its recommended answer, and report the answers in the handoff; a secret it needs is still asked on its own card. When the instructions ask for a plan question, the kickoff intake is that question. When the repository's agent instructions say to commit to the default branch, commit and push there with the repository's checks, in place of `full-stop`.

Done when the change is in a pull request that passed the gate of `full-stop`, or, without a pull request, when it is committed and pushed where the repository's agent instructions say and its checks pass. A change outside a repository is done when it is applied and its effect is seen.
