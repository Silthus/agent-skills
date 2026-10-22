# Changelog

## [1.3.0](https://github.com/Silthus/agent-skills/compare/v1.2.0...v1.3.0) (2026-10-22)


### Features

* **orchestration-wayfinder:** build a spec as strands, one lane and one box each ([#34](https://github.com/Silthus/agent-skills/issues/34)) ([d1f208d](https://github.com/Silthus/agent-skills/commit/d1f208d7037f90f6cfa06c76dba491b8cb0d0bec))
* **orchestration-wayfinder:** cap fan-out at the lanes fleet availability reports ([#26](https://github.com/Silthus/agent-skills/issues/26)) ([1401332](https://github.com/Silthus/agent-skills/commit/14013327330df8dc066978e5e42e54971afaa262))
* **orchestration-wayfinder:** lease one compute box per map from the conductor ([#18](https://github.com/Silthus/agent-skills/issues/18)) ([a3dae4d](https://github.com/Silthus/agent-skills/commit/a3dae4db741742095d33bbcf1ded0d855432b090))
* **orchestration-wayfinder:** run an element-scope usage brief before UI prototype variants ([#30](https://github.com/Silthus/agent-skills/issues/30)) ([d155adf](https://github.com/Silthus/agent-skills/commit/d155adfc9714ae396f14fd62163226170df3b69f))
* **qa-swarm:** add an Anti-Overengineering lens and a spec pass ([#32](https://github.com/Silthus/agent-skills/issues/32)) ([9c8f840](https://github.com/Silthus/agent-skills/commit/9c8f840a1ee2a03d99adb39bf9f697bf4e30bea3))
* **qa-swarm:** judge the design with a code-judo lens, before the PR and in the panel ([#19](https://github.com/Silthus/agent-skills/issues/19)) ([be51980](https://github.com/Silthus/agent-skills/commit/be5198065b09cf03934bb5bef83aeb1b30defc85))
* **qa-swarm:** prove UI changes with a seeded ui-walk and carry the prototype checklist into the build ([#25](https://github.com/Silthus/agent-skills/issues/25)) ([e9313f9](https://github.com/Silthus/agent-skills/commit/e9313f9fc2b429e12ff158cc6d8938b7d890f225))
* **t3-kickoff:** refuse a new worktree while the disk is nearly full ([#28](https://github.com/Silthus/agent-skills/issues/28)) ([2a864cd](https://github.com/Silthus/agent-skills/commit/2a864cd171e5eb754a8f018e7488be3dee897c68))
* **usage-brief:** gather how users and agents use a surface before charting changes it ([#29](https://github.com/Silthus/agent-skills/issues/29)) ([30b353e](https://github.com/Silthus/agent-skills/commit/30b353e96264ba38d75402c3171e1e6bdc7fa021))


### Bug Fixes

* **impact:** check the work against the goal's scope and its run cost ([#22](https://github.com/Silthus/agent-skills/issues/22)) ([49e514a](https://github.com/Silthus/agent-skills/commit/49e514a54891a77bc7ecf63888d9abf3f79ef8e7))
* **orchestration-wayfinder:** let agents load the skill when asked to conduct a map ([#33](https://github.com/Silthus/agent-skills/issues/33)) ([08f9618](https://github.com/Silthus/agent-skills/commit/08f961812752e30ebf211c946c2ef239cc1a1661))
* **orchestration-wayfinder:** rely on automatic compaction instead of a 200k handoff ([#23](https://github.com/Silthus/agent-skills/issues/23)) ([ba85c0f](https://github.com/Silthus/agent-skills/commit/ba85c0f4331576bb4169fad625ca687e9fbbe93e))
* **orchestration-wayfinder:** run fleet lanes at every conductor wake ([#24](https://github.com/Silthus/agent-skills/issues/24)) ([caeaab5](https://github.com/Silthus/agent-skills/commit/caeaab597d16571bfe90ad5cb49c2a0a38d5ca14))
* **qa-swarm:** bound review cost to the diff and two final reads ([#27](https://github.com/Silthus/agent-skills/issues/27)) ([deefe31](https://github.com/Silthus/agent-skills/commit/deefe315b87ca0a1611b380622817a8b0e80109d))
* **share-preview:** check previews in a signed-in browser and serve production builds ([#21](https://github.com/Silthus/agent-skills/issues/21)) ([87cb079](https://github.com/Silthus/agent-skills/commit/87cb079e620d32f59abe6863c95b5a2169692b85))
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
