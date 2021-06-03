# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-alpha.5](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2021-06-03)


### Features

* mut array methods in patch ([22b095f](https://github.com/3mcd/javelin/commit/22b095fc2536680961342a5bc1edde5070fcb2ab))
* observe coming along nicely ([cf88507](https://github.com/3mcd/javelin/commit/cf88507e0a615f613bb7dc5e86cf1b732b784cb8))
* patch encoding ([6f26b2f](https://github.com/3mcd/javelin/commit/6f26b2f750c152988931bad662f5bb23200c1905))
* track checkpoint ([b0d04bc](https://github.com/3mcd/javelin/commit/b0d04bc0837d030d0398f67a42f0c9efcb05a378))





# [1.0.0-alpha.4](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2021-05-24)


### Features

* attach model automatically ([ffee822](https://github.com/3mcd/javelin/commit/ffee822faeb4290f042d5fe38c3ebf07aa693e74))
* primitive model extensions ([5534c77](https://github.com/3mcd/javelin/commit/5534c77b40010580bf863bbf70ae53e73a19f93a))





# [1.0.0-alpha.3](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2021-05-23)


### Bug Fixes

* use uint32 for message part byte length ([aa96bb6](https://github.com/3mcd/javelin/commit/aa96bb6901ccbd24044492bc1ae1859f614fa78d))


### Features

* add set and map types to components ([cd67a1b](https://github.com/3mcd/javelin/commit/cd67a1b87ec475157a98863b8ef1c7a862ce7c13))
* model enhancements ([65bbe77](https://github.com/3mcd/javelin/commit/65bbe772b631bf06b71870348827c315c397fbc4))
* more api improvements ([6e4f27b](https://github.com/3mcd/javelin/commit/6e4f27b8e200ed49679e1512dccc1fea22010841))
* prefer function keyword; hrtime-loop accuracy improvements and api tweaks ([ade3c9a](https://github.com/3mcd/javelin/commit/ade3c9a219a90844abda31903a44a30f2812ea87))
* support complex types in patch ([bf7ce01](https://github.com/3mcd/javelin/commit/bf7ce01b32e2f5ee910bc13cacaad8c101a30fb0))
* world generic improvement; simplify example ([1b70b4b](https://github.com/3mcd/javelin/commit/1b70b4be9f1946103cb409c946a941307bb27ba3))





# [1.0.0-alpha.2](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2021-05-18)


### Features

* remove spawn op; useMonitor reset only on query signature change ([56cab8d](https://github.com/3mcd/javelin/commit/56cab8d0b7d7fa214692d55b21b75c727fe64847))





# [1.0.0-alpha.1](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2021-05-17)


### Bug Fixes

* **net:** nested arrayOfs in encoded model ([29b3779](https://github.com/3mcd/javelin/commit/29b3779feb91fe86b0a14232b060e9777a031418))





# [1.0.0-alpha.0](https://github.com/3mcd/javelin/compare/v0.22.0...v1.0.0-alpha.0) (2021-05-16)


### chore

* remove branch config ([997f1dd](https://github.com/3mcd/javelin/commit/997f1dd1b4a82006ed5ce1da8585e69a1bcb07c0))


### Features

* protocol rework + API overhaul ([#164](https://github.com/3mcd/javelin/issues/164)) ([053b1df](https://github.com/3mcd/javelin/commit/053b1dfc5972786b86d06339db8c6751a8dae6f4))


### BREAKING CHANGES

* API enhancements, new protocol, example





# [0.22.0](https://github.com/3mcd/javelin/compare/v0.21.2...v0.22.0) (2021-04-15)


### Bug Fixes

* add spawn op type to message producer getReliableMessages ([#159](https://github.com/3mcd/javelin/issues/159)) ([207c5ce](https://github.com/3mcd/javelin/commit/207c5ce0b7036cfe861fa52ae9570dc41485bb6a))
* fix callback argument type ([#157](https://github.com/3mcd/javelin/issues/157)) ([01945a4](https://github.com/3mcd/javelin/commit/01945a4d8d6e7c743548b630355de33c3f68eaca))


### Features

* **hrtimer-loop:** add isRunning method ([#158](https://github.com/3mcd/javelin/issues/158)) ([a5a2440](https://github.com/3mcd/javelin/commit/a5a24409143503df5f6e9efd35e315d9b24bc0dc))





## [0.21.2](https://github.com/3mcd/javelin/compare/v0.21.1...v0.21.2) (2021-03-25)


### Bug Fixes

* trigger types and include existing entities/components ([#155](https://github.com/3mcd/javelin/issues/155)) ([5c3ba3d](https://github.com/3mcd/javelin/commit/5c3ba3d8253c42b2431942f461d7d8742a8bec27))





## [0.21.1](https://github.com/3mcd/javelin/compare/v0.21.0...v0.21.1) (2021-03-24)


### Bug Fixes

* ensure type signature has ascending order ([dbfa6d4](https://github.com/3mcd/javelin/commit/dbfa6d478de9e585f97de6bc23351a2bb25f1e63))





# [0.21.0](https://github.com/3mcd/javelin/compare/v0.20.0...v0.21.0) (2021-03-24)


### Bug Fixes

* fix tests ([debfc16](https://github.com/3mcd/javelin/commit/debfc16a283260d318c4a21bc101065e4c90c5f6))
* use WeakMap for system ids ([8982d44](https://github.com/3mcd/javelin/commit/8982d44850ce9f1374b977ba04beccf9aa5bd1bb))
* **world:** assign systems auto-incrementing unique ids ([#144](https://github.com/3mcd/javelin/issues/144)) ([861afcb](https://github.com/3mcd/javelin/commit/861afcb61e459c1dcbfd81bfee939939a264b270))


### Features

* query improvements, monitors, triggers and not filters ([#149](https://github.com/3mcd/javelin/issues/149)) ([9f7e45a](https://github.com/3mcd/javelin/commit/9f7e45a9d6ee42b46f0f537e8f798c7c70b34388))
* **pack:** add pack lib ([#146](https://github.com/3mcd/javelin/issues/146)) ([d8ffb52](https://github.com/3mcd/javelin/commit/d8ffb527a097b431e0a0e7303539c3fece284213))
* world.snapshot ([#145](https://github.com/3mcd/javelin/issues/145)) ([32b7b53](https://github.com/3mcd/javelin/commit/32b7b533e061a62343d6532281949bd8db5ea602))





# [0.20.0](https://github.com/3mcd/javelin/compare/v0.19.4...v0.20.0) (2021-03-04)


### Features

* add effects lib and fix global effect bug ([#142](https://github.com/3mcd/javelin/issues/142)) ([337c8ba](https://github.com/3mcd/javelin/commit/337c8bad679eb15465bdebdadcecc63d29950db8))
* fix request effect and tests ([1c35e62](https://github.com/3mcd/javelin/commit/1c35e620c00a14f71e433a60fb3fc34ceb53051d))
* merge effects package into ecs; update examples ([099a9d7](https://github.com/3mcd/javelin/commit/099a9d79e1064016b5b6752e49dbdf4065c0b27c))
* world.reset ([#135](https://github.com/3mcd/javelin/issues/135)) ([756aeb4](https://github.com/3mcd/javelin/commit/756aeb4ac7ffa0be09a5d4193b554e9332b33776))
