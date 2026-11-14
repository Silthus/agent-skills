# Changelog

## [2.0.0](https://github.com/Silthus/agent-skills/compare/v1.3.0...v2.0.0) (2026-11-14)


### ⚠ BREAKING CHANGES

* **t3-kickoff:** a workspace safety policy no longer refuses linked worktrees whose Git common directory lies in a protected root.
* babysit-pr no longer merges or runs the post-deploy watch. Use rollout, full-send, or stamp-pr.

### Features

* add full-stop, full-send, stamp-pr and rollout; babysit-pr never merges ([07ba18c](https://github.com/Silthus/agent-skills/commit/07ba18c4c135ac872283c4ed8c68f51fe71dc3de))
* add quality-loop and signal-loop skills ([7a89f66](https://github.com/Silthus/agent-skills/commit/7a89f662e7022e52acaff22682871bdd773f0ad6))
* add the explainer skill ([0a20fab](https://github.com/Silthus/agent-skills/commit/0a20fabeecf434a48fbf7c7babbbd12c0836d29c))
* add writing-runbooks and responding-to-alerts skills ([ea99d1e](https://github.com/Silthus/agent-skills/commit/ea99d1e8ffeb126cd462e1a998f458b0d9fcd3c8))
* **babysit-pr:** stop fix loops that make no progress and guard rebases against leaks ([bb9edc8](https://github.com/Silthus/agent-skills/commit/bb9edc8fe0ba051aa823054682493dbe52faa821))
* **full-stop:** add Ready on green, which marks a PR ready once the gate passes ([dabd738](https://github.com/Silthus/agent-skills/commit/dabd7383cb99ad838fe56c3704cc408546d58704))
* **full-stop:** forecast the approval bot's verdict at handoff ([f28488e](https://github.com/Silthus/agent-skills/commit/f28488e32288512a21e8552d06bf5f4638f57846))
* **full-stop:** kickoff intake for secrets and inputs, lane-end drop ([38f111f](https://github.com/Silthus/agent-skills/commit/38f111f41e2a59026d161324c34264cfa62e04f6))
* **impact:** decide a fix's worth before it is built; park the rest ([595e4eb](https://github.com/Silthus/agent-skills/commit/595e4eb98036020e1b4ac9b7d875d5ba772d348e))
* **impact:** link each PR to the metric its retro reads ([70d623e](https://github.com/Silthus/agent-skills/commit/70d623e918f49098c179e87466f541c0ce5fe1b8))
* **impact:** park code-reading side fixes, ask only on evidence ([987232f](https://github.com/Silthus/agent-skills/commit/987232fc55f23b03aaea748e6c0220c00f0a6949))
* **impact:** start decision before new work begins ([eb1907e](https://github.com/Silthus/agent-skills/commit/eb1907e106bf741ffd04f1c3a2525d9e2718a36d))
* **incident:** investigate and communicate production incidents ([c08213d](https://github.com/Silthus/agent-skills/commit/c08213d382cf3e12af519273433b08575747b700))
* **lessons:** keep an incident-backed log of what did not work ([af84c34](https://github.com/Silthus/agent-skills/commit/af84c3439588986f71aebb44c834e9a3d8177a15))
* merge an approved stack with one queue entry on its top PR ([c7aee34](https://github.com/Silthus/agent-skills/commit/c7aee34eae80439029ebe22d9e6b837d8b78b9d9))
* **merge-risk:** end the risk callout with a one-step revert line ([59b4c4d](https://github.com/Silthus/agent-skills/commit/59b4c4dbc2e3bf26b14a30e3763f15ba778d0ff5))
* **merge-risk:** grade against the switch-off, name commitments, add a Rollout section ([8a8546e](https://github.com/Silthus/agent-skills/commit/8a8546ec731e498a63a1f66b2298d1756cbbf6cb))
* **merge-risk:** grade from the measured behavior delta ([664d613](https://github.com/Silthus/agent-skills/commit/664d6133a02df0aff93fec7790ab10e1efe3281e))
* **merge-risk:** grade the true risk from traced hot paths ([65896d8](https://github.com/Silthus/agent-skills/commit/65896d863f1d89ca25da54d291dae8b8de87dba3))
* **orchestration-wayfinder:** drop the quota lane cap and dispatch the whole frontier ([c6508ed](https://github.com/Silthus/agent-skills/commit/c6508ed1f0778b042a4a81a9a96b88ab8c31f9fc))
* **orchestration-wayfinder:** harvest lessons at map close and surface NEEDS_HUMAN lanes ([ab84cd3](https://github.com/Silthus/agent-skills/commit/ab84cd356aa5cb0096ba1369ff9901becae58308))
* **orchestration-wayfinder:** ship specs as short stacks owned by their own threads ([14dd057](https://github.com/Silthus/agent-skills/commit/14dd0573fbc83cc7ff98b735b36916ed90c6f3d7))
* **orchestration-wayfinder:** try e2e walks as the spec's proof contract ([3a1bcd2](https://github.com/Silthus/agent-skills/commit/3a1bcd204097e9181da08dc0851bf996a2a86113))
* **pr-description:** add four inserts alongside the repository's description skill ([ac6d2be](https://github.com/Silthus/agent-skills/commit/ac6d2be58f9dd84dd4ed4b36bca7402c274a18d8))
* **pull-requests:** answer people with a reaction or the user's own words ([5d46963](https://github.com/Silthus/agent-skills/commit/5d469633eec702c61ca72ae86269175585ce0ec4))
* **pull-requests:** ask before stamping another team's code ([c99e870](https://github.com/Silthus/agent-skills/commit/c99e870676d09d72c9131bfd4fd4d8aa15818d6a))
* **pull-requests:** build review-lens from an architecture and style interview ([b8cf1bb](https://github.com/Silthus/agent-skills/commit/b8cf1bbee36f250ef264e732d61e5dcb92140736))
* **pull-requests:** decide gaps by tier, one mark set, end-of-run report ([398d5b1](https://github.com/Silthus/agent-skills/commit/398d5b1e403fd667d164c4aa0b84f957a0c8b782))
* **pull-requests:** write proof receipts with fleet proof receipt ([d978bf5](https://github.com/Silthus/agent-skills/commit/d978bf549c9068fea63ff58d571a54a0f2eb9deb))
* **qa-swarm:** add a sweep lens, anchor every finding, and prove pre-existing failures from the log ([e5a1193](https://github.com/Silthus/agent-skills/commit/e5a11937f4829f3de9bf21ba6f35f9edee126653))
* **qa-swarm:** record reviewer misses and grow REVIEW.md from them ([46d7444](https://github.com/Silthus/agent-skills/commit/46d74443ff310b24e348aee8dd1b38f92505b651))
* **qa-swarm:** size contract after the design pass ([238280c](https://github.com/Silthus/agent-skills/commit/238280c873157f816862557a674c3efed92d4f37))
* **quality-loop:** give each loop its own WIP limit ([f2a9a52](https://github.com/Silthus/agent-skills/commit/f2a9a524a9c46812607b9143c22b039a3cd68c7d))
* **rollout:** mark the deploy on the insights a PR's Impact section links ([474e10d](https://github.com/Silthus/agent-skills/commit/474e10d1d44b4fec0e379b3521d58cafc634f552))
* **rollout:** merge a migration's readers only after it reaches production ([b527101](https://github.com/Silthus/agent-skills/commit/b5271014c1d5df8075cb468dbbf49e519409bec2))
* **rollout:** run the user's production debug tool on a bad signal ([cf0423f](https://github.com/Silthus/agent-skills/commit/cf0423fc2d803bd0db75250cb5e35f96e2d49ed1))
* **signal-loop:** make the Inbox the shared queue, track collector misses ([d3db07f](https://github.com/Silthus/agent-skills/commit/d3db07fe75b90bc09e044c08a62b838d0b01bda7))
* slice to the stamp, gate ready on the panel, and check deploy order before enqueue ([233c591](https://github.com/Silthus/agent-skills/commit/233c5911fc47ee9458203f118c2659589323a0d6))
* **stamp-pr:** keep auth, billing, CI, release, and installer changes for people ([ac8c661](https://github.com/Silthus/agent-skills/commit/ac8c661be94b13b519448449dd164c22fa501e2d))
* **stamp-pr:** refuse a stamp only for a danger-area hunk ([3b8ba73](https://github.com/Silthus/agent-skills/commit/3b8ba73e7c7de81356896462258ecc98ed09fb32))
* **t3-kickoff:** let new worktrees of a protected checkout launch ([f2ca56e](https://github.com/Silthus/agent-skills/commit/f2ca56ea90d66f80fb4c6fdcd7a87237ea0bee56))
* **t3-kickoff:** start a No project thread with --scratch ([0183f76](https://github.com/Silthus/agent-skills/commit/0183f7689e54fc011396bcda31c756b22043d715))
* **writing-runbooks:** fit runbooks into a repository's own format ([ebdb069](https://github.com/Silthus/agent-skills/commit/ebdb0690778b7d105193ec297b3e1e89e3f0a2b0))
* **writing-runbooks:** write to the repository's proven runbook shape ([3a4d2e7](https://github.com/Silthus/agent-skills/commit/3a4d2e7d10837d2ab8eef630c792622ae1c8ef81))
* **writing-voice:** tune the Slack voice to the edits Michael makes before sending ([7a03e57](https://github.com/Silthus/agent-skills/commit/7a03e5736368a5c897631b5fb2bed7eb562aa6c0))
* **writing-voice:** write Slack messages short and direct, with emoji for warmth ([2773d79](https://github.com/Silthus/agent-skills/commit/2773d7977002b78f8fe4a57a6cad1e6bcf85509f))


### Bug Fixes

* **check:** match private repository names by hash instead of publishing them ([d6b019d](https://github.com/Silthus/agent-skills/commit/d6b019d5f5c738d715e459f11a76e0d4d9269310))
* close the review findings on full-send, full-stop, babysit-pr and rollout ([7ef09ef](https://github.com/Silthus/agent-skills/commit/7ef09ef1bb61fa3aaf8723341e2cf8dd59e65017))
* **explainer:** shape each picture to its mechanism ([196b823](https://github.com/Silthus/agent-skills/commit/196b823cb01e8ab74d576b1bc7067bec241cd124))
* **full-send:** cut thin slices before the build, not in review ([13ef977](https://github.com/Silthus/agent-skills/commit/13ef97721e818057401379a568ee1ae9c4483058))
* **full-stop,rollout:** ask code owners at draft time and wait on the deploy bot's comment ([7096530](https://github.com/Silthus/agent-skills/commit/709653035f098918fa5b8e9224f4b9f1caccd421))
* **full-stop:** trigger on 'create a draft PR' and 'draft PR' ([2be6ca2](https://github.com/Silthus/agent-skills/commit/2be6ca2f9643979dd7ae887da158aa21454a37ee))
* **incident:** check open deadlines and earlier claims first, grade totals by their weakest part ([ddc0bde](https://github.com/Silthus/agent-skills/commit/ddc0bdee29ee5611d3aa4f5fd36443a5ae5330d1))
* **incident:** cover lying records, later actions, bounded numbers, and scheduled failures ([8655afe](https://github.com/Silthus/agent-skills/commit/8655afea104e91570f22f8b1ae5c5fb8d813e360))
* **incident:** dispatch before sizing, add an update-only path and done lines for every workstream ([dd34f9a](https://github.com/Silthus/agent-skills/commit/dd34f9afd882a1064c7647392b95281cc36f3d76))
* **incident:** dispatch workstreams early, pin claims, keep deleted items, one customer table ([d768d61](https://github.com/Silthus/agent-skills/commit/d768d618968327fe438709d6353fe23110b4b7b2))
* **incident:** fall back to a model that can start when the table's model cannot ([e8f6f76](https://github.com/Silthus/agent-skills/commit/e8f6f76124f6a4a5e97d66e085f2afe4630dafb7))
* **incident:** find the signature loosely first, name a missing second route, fall back to the channel for open tasks ([15c6e21](https://github.com/Silthus/agent-skills/commit/15c6e21edc82b6151744a31d39f91a96a42da1c7))
* **incident:** recheck live facts in updates, split no-workers from report-once, carry deadlines ([327ce0c](https://github.com/Silthus/agent-skills/commit/327ce0c44209c12b1583bc5074673b07a4ae19c1))
* **incident:** search the full span first, start workers at once, recheck recovery at execution ([1cf059f](https://github.com/Silthus/agent-skills/commit/1cf059f5a370020d7dc9e65047a080b2cca9d638))
* **incident:** split the update path into steps with a done line, check reruns both ways ([e4088af](https://github.com/Silthus/agent-skills/commit/e4088afc78a32a54a61378e184cd41bc8ecad53f))
* keep private data out of the public skills ([98bfe64](https://github.com/Silthus/agent-skills/commit/98bfe648405c70c81d8c22e366ab4a6b29793dcf))
* **merge-risk:** drop the routine Fable risk-judge step ([a1ec3fc](https://github.com/Silthus/agent-skills/commit/a1ec3fc133fecb299d86aac5b84d2034e159b2d0))
* **merge-risk:** grade by blast radius, not by danger area ([a664d6a](https://github.com/Silthus/agent-skills/commit/a664d6a99300767702883be78521a529e481d40d))
* **orchestration-wayfinder:** mark the conductor hold as awaited ([57fe3fa](https://github.com/Silthus/agent-skills/commit/57fe3fa577f9474609cccfacaa1ecbe2fe28fc48))
* **pull-requests:** hold the merge on a person's comment and keep PR watches with the owning thread ([c219d78](https://github.com/Silthus/agent-skills/commit/c219d78384c204438c0b27a7d94a8419be04f374))
* **pull-requests:** split a stack when a layer waits on a person, and report that blocker first ([b018e54](https://github.com/Silthus/agent-skills/commit/b018e548c2fc967729bfe5da7a1326f6b32f23d9))
* **qa-swarm:** run shell proofs with fleet proof run ([bc2c6f4](https://github.com/Silthus/agent-skills/commit/bc2c6f404a64c9b18665995901c0c31668b2c5f4))
* **quality-loop:** hold every test and fix lane to the outside-in bar ([ab160cd](https://github.com/Silthus/agent-skills/commit/ab160cd325c2ac9e0f3ad7937f56f2a090030962))
* **quality-loop:** start normal lanes in a worktree on the coordinator's machine ([1ceabba](https://github.com/Silthus/agent-skills/commit/1ceabba209316983de82dc5082f25bb525f99fbc))
* **rollout:** drop the working-day limit on the 100% stage ([68961ac](https://github.com/Silthus/agent-skills/commit/68961acecf95b55e986e35d5ec6516afb2564100))
* **rollout:** wait on the Trunk queue after /trunk merge instead of reading its comment once ([5746ce2](https://github.com/Silthus/agent-skills/commit/5746ce2bae5b6f1d675388ba33409b03ee2e7299))
* **signal-loop:** count only owned Inbox reports as covered, claim reports for lanes ([b1d337a](https://github.com/Silthus/agent-skills/commit/b1d337a0c08554ea013117e480135b88a58e6050))
* **slack-pr-update:** drop the fork CI-ack notes ([885f018](https://github.com/Silthus/agent-skills/commit/885f0185b75ae29aef634d304e4758d2ef2c4802))
* **t3-kickoff:** refuse a new worktree below 25 GB free ([13101ca](https://github.com/Silthus/agent-skills/commit/13101caf75ba81dec6a356c0f71cbce2377f95b5))
* **writing-runbooks:** fold in what the first two real runs found ([422a201](https://github.com/Silthus/agent-skills/commit/422a201f9565cb643ae087bc64d94396faa30084))
* **writing-runbooks:** ignore headings inside code fences when finding a section ([40b819e](https://github.com/Silthus/agent-skills/commit/40b819ed854a9ef33b7601e5226e3217b6f3a4ab))
* **writing-runbooks:** trigger on a new or changed alert and next to a repository's own format ([d4ba46c](https://github.com/Silthus/agent-skills/commit/d4ba46c7049b6af913b4713790323301a6170f54))
* **writing-voice:** drop the purple heart emoji ([ad7666e](https://github.com/Silthus/agent-skills/commit/ad7666ea8b505090671b448317c2310dfea46e5b))

## [1.3.0](https://github.com/Silthus/agent-skills/compare/v1.2.0...v1.3.0) (2026-10-26)


### Features

* **orchestration-wayfinder:** build a spec as strands, one lane and one box each ([#34](https://github.com/Silthus/agent-skills/issues/34)) ([d1f208d](https://github.com/Silthus/agent-skills/commit/d1f208d7037f90f6cfa06c76dba491b8cb0d0bec))
* **orchestration-wayfinder:** cap fan-out at the lanes fleet availability reports ([#26](https://github.com/Silthus/agent-skills/issues/26)) ([1401332](https://github.com/Silthus/agent-skills/commit/14013327330df8dc066978e5e42e54971afaa262))
* **orchestration-wayfinder:** lease one compute box per map from the conductor ([#18](https://github.com/Silthus/agent-skills/issues/18)) ([a3dae4d](https://github.com/Silthus/agent-skills/commit/a3dae4db741742095d33bbcf1ded0d855432b090))
* **orchestration-wayfinder:** render lane prompts from one checked template and add an every-wake checklist ([b50ef24](https://github.com/Silthus/agent-skills/commit/b50ef2481d9d88ffd5527a8ab51c786abd547166))
* **orchestration-wayfinder:** run an element-scope usage brief before UI prototype variants ([#30](https://github.com/Silthus/agent-skills/issues/30)) ([d155adf](https://github.com/Silthus/agent-skills/commit/d155adfc9714ae396f14fd62163226170df3b69f))
* **qa-swarm:** add an Anti-Overengineering lens and a spec pass ([#32](https://github.com/Silthus/agent-skills/issues/32)) ([9c8f840](https://github.com/Silthus/agent-skills/commit/9c8f840a1ee2a03d99adb39bf9f697bf4e30bea3))
* **qa-swarm:** judge the design with a code-judo lens, before the PR and in the panel ([#19](https://github.com/Silthus/agent-skills/issues/19)) ([be51980](https://github.com/Silthus/agent-skills/commit/be5198065b09cf03934bb5bef83aeb1b30defc85))
* **qa-swarm:** prove UI changes with a seeded ui-walk and carry the prototype checklist into the build ([#25](https://github.com/Silthus/agent-skills/issues/25)) ([e9313f9](https://github.com/Silthus/agent-skills/commit/e9313f9fc2b429e12ff158cc6d8938b7d890f225))
* run fleet proof reviews, responses, verified answers, and the judge ([efc48f9](https://github.com/Silthus/agent-skills/commit/efc48f982922129f561df77d26d89425392ed19c))
* run qa-swarm panels through fleet proof review --lens ([222bae6](https://github.com/Silthus/agent-skills/commit/222bae6064136cecb36b5f48809b59139b173f79))
* **t3-kickoff:** refuse a new worktree while the disk is nearly full ([#28](https://github.com/Silthus/agent-skills/issues/28)) ([2a864cd](https://github.com/Silthus/agent-skills/commit/2a864cd171e5eb754a8f018e7488be3dee897c68))
* **usage-brief:** gather how users and agents use a surface before charting changes it ([#29](https://github.com/Silthus/agent-skills/issues/29)) ([30b353e](https://github.com/Silthus/agent-skills/commit/30b353e96264ba38d75402c3171e1e6bdc7fa021))


### Bug Fixes

* **impact:** check the work against the goal's scope and its run cost ([#22](https://github.com/Silthus/agent-skills/issues/22)) ([49e514a](https://github.com/Silthus/agent-skills/commit/49e514a54891a77bc7ecf63888d9abf3f79ef8e7))
* **orchestration-wayfinder:** apply final-read findings on lane prompts ([71e556e](https://github.com/Silthus/agent-skills/commit/71e556e27e601240f3183e5c49dc343b96234099))
* **orchestration-wayfinder:** apply review findings on lane prompts and the wake checklist ([8f2331a](https://github.com/Silthus/agent-skills/commit/8f2331a618d4fe7d6f9132014f3071549f878b17))
* **orchestration-wayfinder:** bound the gh pattern and name templates per runtime only in T3 ([4914c50](https://github.com/Silthus/agent-skills/commit/4914c5059f0cfe9d6611fc4372e7f83680f4cd3f))
* **orchestration-wayfinder:** close gaps in the lane prompt check ([1237f55](https://github.com/Silthus/agent-skills/commit/1237f559faa7a54a1223a6c1f3c44cea77540817))
* **orchestration-wayfinder:** define the successor transcript value ([e819474](https://github.com/Silthus/agent-skills/commit/e8194744004cb58609dc3b884542b78151a82ea4))
* **orchestration-wayfinder:** give successors a template in every runtime ([d0a6153](https://github.com/Silthus/agent-skills/commit/d0a61530c94c65f6756b65f6ef26e4f34774b3ef))
* **orchestration-wayfinder:** let agents load the skill when asked to conduct a map ([#33](https://github.com/Silthus/agent-skills/issues/33)) ([08f9618](https://github.com/Silthus/agent-skills/commit/08f961812752e30ebf211c946c2ef239cc1a1661))
* **orchestration-wayfinder:** rely on automatic compaction instead of a 200k handoff ([#23](https://github.com/Silthus/agent-skills/issues/23)) ([ba85c0f](https://github.com/Silthus/agent-skills/commit/ba85c0f4331576bb4169fad625ca687e9fbbe93e))
* **orchestration-wayfinder:** run fleet lanes at every conductor wake ([#24](https://github.com/Silthus/agent-skills/issues/24)) ([caeaab5](https://github.com/Silthus/agent-skills/commit/caeaab597d16571bfe90ad5cb49c2a0a38d5ca14))
* **qa-swarm:** bound review cost to the diff and two final reads ([#27](https://github.com/Silthus/agent-skills/issues/27)) ([deefe31](https://github.com/Silthus/agent-skills/commit/deefe315b87ca0a1611b380622817a8b0e80109d))
* **qa-swarm:** fall back to the full local gate and keep lane-gate wording distinct ([bdd4cee](https://github.com/Silthus/agent-skills/commit/bdd4ceebcc3c9f9647df3e43a36bdb861a117b18))
* **qa-swarm:** make the full local gate the lane gate when none is named ([66e5803](https://github.com/Silthus/agent-skills/commit/66e580342acb04eda3a9b41e54ce9d572207ba2e))
* **qa-swarm:** name both CI cases in the Ready bar and list a repo without CI as a gap ([9310282](https://github.com/Silthus/agent-skills/commit/9310282c8c0c587d0837ec1112dd626d7eeda0f6))
* **qa-swarm:** run the lane gate locally and require the full gate in CI ([7b2a433](https://github.com/Silthus/agent-skills/commit/7b2a43360eeac6744fb1a14c7bba03666d12509a))
* report CI and the lane gate before the proof gate, and record proof honestly ([1e9a808](https://github.com/Silthus/agent-skills/commit/1e9a8083677cc083e1ed55cd3c8ed71e3dc163dd))
* require evidence before the Anti-Overengineering lens keeps safeguards ([f6b1047](https://github.com/Silthus/agent-skills/commit/f6b10475e73d0da9dd327c6aa56a6eda1a8b74f2))
* **share-preview:** check previews in a signed-in browser and serve production builds ([#21](https://github.com/Silthus/agent-skills/issues/21)) ([87cb079](https://github.com/Silthus/agent-skills/commit/87cb079e620d32f59abe6863c95b5a2169692b85))
* wait in one blocking command instead of a sleep per turn ([32ff3b7](https://github.com/Silthus/agent-skills/commit/32ff3b743d8a969cb9d86b4a361070519f16822f))
* **writing-voice:** write a PR Slack message only when Michael asks for one ([#31](https://github.com/Silthus/agent-skills/issues/31)) ([b21571b](https://github.com/Silthus/agent-skills/commit/b21571b87b3d75ad1465e5628da9c05bf30aa244))

## [1.2.0](https://github.com/Silthus/agent-skills/compare/v1.1.0...v1.2.0) (2026-10-19)


### Features

* **architecture:** draw modules as frames with seam bars, one premise per round, deepen while we're here ([#11](https://github.com/Silthus/agent-skills/issues/11)) ([79b057c](https://github.com/Silthus/agent-skills/commit/79b057c0fbfb8637f74f60243ab0297827d670c1))
* **architecture:** show each round in the thread and evolve one diagram per rung ([#8](https://github.com/Silthus/agent-skills/issues/8)) ([d5ccda0](https://github.com/Silthus/agent-skills/commit/d5ccda0072f9a2d6a26f32832984f2e01644f793))
* **impact:** check every map and PR against the team goal it pays into ([#10](https://github.com/Silthus/agent-skills/issues/10)) ([4f1dee5](https://github.com/Silthus/agent-skills/commit/4f1dee5fb9f3521decf983238c320a5fcffca05f))
* **pr-description:** record each decision as a question, answer and who decided it ([#9](https://github.com/Silthus/agent-skills/issues/9)) ([81167ae](https://github.com/Silthus/agent-skills/commit/81167ae732bc94b73ebb4e1a8127ca484629de62))
* **share-preview:** start previews through fleet heavy, on a leased compute box when there is one ([03386b7](https://github.com/Silthus/agent-skills/commit/03386b7c61c689af0c4c5bd83635fc704bcc1471))


### Bug Fixes

* **architecture:** find Playwright's arm64 headless shell when rendering diagrams ([#12](https://github.com/Silthus/agent-skills/issues/12)) ([04bdf8c](https://github.com/Silthus/agent-skills/commit/04bdf8cce45a566de69b9679d81102b9f468dde0))
* keep waiting T3 threads on the Working shelf with a Monitor task ([5163c9e](https://github.com/Silthus/agent-skills/commit/5163c9ed6c0c61dbfb18c1c8988b373f1e6f683a))
* **orchestration-wayfinder:** chart maps in the configured map tracker ([#17](https://github.com/Silthus/agent-skills/issues/17)) ([e021e98](https://github.com/Silthus/agent-skills/commit/e021e98e58c1ef998e38f509bd15e4f6fe30c5f3))
* **orchestration-wayfinder:** keep T3 conductors out of the inbox after status updates ([3fa55ab](https://github.com/Silthus/agent-skills/commit/3fa55ab64d1bc17a28d9ba53b6ac088d3c79ed30))
* **orchestration-wayfinder:** run HITL lanes as T3 threads and fix ticket branch names ([#13](https://github.com/Silthus/agent-skills/issues/13)) ([bdd5a83](https://github.com/Silthus/agent-skills/commit/bdd5a83665b198497eb034a1b4c5e069a698fbcb))
* **pr-description:** keep the Decisions table current as work continues on a PR ([#15](https://github.com/Silthus/agent-skills/issues/15)) ([504072f](https://github.com/Silthus/agent-skills/commit/504072fba19db8c733435c2bf286d7d7ecbb915b))
* **share-preview:** fix the review findings in the Fleet preview steps ([1a1bf6d](https://github.com/Silthus/agent-skills/commit/1a1bf6defb06d0424b9b9109dfb92babf2737549))
* **share-preview:** keep the failed-stop rule in the restart step and scope it to a move ([bd75be1](https://github.com/Silthus/agent-skills/commit/bd75be1e876930d55ce04a283ff1eaeef1edf5a5))
* **share-preview:** name previews uniquely and resync a leased dev server after edits ([a04c2a6](https://github.com/Silthus/agent-skills/commit/a04c2a67dc76e1cb8ba1cdfae2695bd0c220ee1a))
* **share-preview:** recheck the port before a restart and go on after a failed stop ([756a693](https://github.com/Silthus/agent-skills/commit/756a69371be11ca431e956b57da82889840c4828))
* **share-preview:** recheck the port before a restart and go on after a failed stop ([54df1e7](https://github.com/Silthus/agent-skills/commit/54df1e73e83605a3032374ed37fef85354b32b37))
* **share-preview:** say a preview can still run after a failed cleanup stop ([11dffa9](https://github.com/Silthus/agent-skills/commit/11dffa993b46f976ea47c5f3d352faf33f3bcbad))
* **share-preview:** stop and rebuild a leased preview before restarting it after edits ([91bbf2a](https://github.com/Silthus/agent-skills/commit/91bbf2aa45d4b631c6184fa56c767a182033a7c6))

## [1.1.0](https://github.com/Silthus/agent-skills/compare/v1.0.0...v1.1.0) (2026-10-16)


### Features

* **pull-requests:** add review-lens ([077dc68](https://github.com/Silthus/agent-skills/commit/077dc689634f862df19e5e69b4f5c121a2fa8ebd))
* **pull-requests:** make qa-swarm prove changes in the running system ([#4](https://github.com/Silthus/agent-skills/issues/4)) ([584cb03](https://github.com/Silthus/agent-skills/commit/584cb0368db9e934b0bb867a2e760875d7728a92))
* **pull-requests:** run only the area owners' and the author's perspectives in the qa-swarm Team lane ([6fd7b20](https://github.com/Silthus/agent-skills/commit/6fd7b2093f26fac070134abcc7ab33b4f4e552a0))
* **pull-requests:** watch production after babysit-pr merges ([#5](https://github.com/Silthus/agent-skills/issues/5)) ([6d00834](https://github.com/Silthus/agent-skills/commit/6d00834632e25a384aee96f12e2af93a21bfbd13))


### Bug Fixes

* **pull-requests:** let the review-lens interview lead with what the person values ([675f1ec](https://github.com/Silthus/agent-skills/commit/675f1ec05c6cbdaef84cd01bcc5d841ff5077d79))
* **pull-requests:** publish review-lens perspectives in the team's project ([0511565](https://github.com/Silthus/agent-skills/commit/051156513eb12f3ae7593becaf6a7ad9e10df330))
* **pull-requests:** tighten the pull request skills without changing behavior ([#6](https://github.com/Silthus/agent-skills/issues/6)) ([040989b](https://github.com/Silthus/agent-skills/commit/040989bda59909af689cb718b84e6553c1ba81da))
* **pull-requests:** tighten the review-lens interview wording ([905165e](https://github.com/Silthus/agent-skills/commit/905165eb432fcdaf56df110dfb7f289de69708d9))

## 1.0.0 (2026-10-15)


### Features

* publish my day-to-day skills, grouped by theme ([eb42deb](https://github.com/Silthus/agent-skills/commit/eb42debd1f304c74a32b8a560c153f48d18c2f85))
* shape architecture in rounds, gate ready PRs on bot threads, and record decisions ([541f13e](https://github.com/Silthus/agent-skills/commit/541f13efbf9af5786618235bc7e0793f3b919cc7))
