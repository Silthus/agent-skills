# Changelog

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
