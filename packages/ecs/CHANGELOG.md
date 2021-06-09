# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-alpha.7](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2021-06-09)


### Bug Fixes

* ignore transient entities in monitor ([db43078](https://github.com/3mcd/javelin/commit/db4307852df3852eed415a4265f40020322b9a15))





# [1.0.0-alpha.6](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2021-06-04)


### Features

* patch/update prioritization ([a73ef89](https://github.com/3mcd/javelin/commit/a73ef89f008a6c0787e0170540020c265780b627))





# [1.0.0-alpha.5](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2021-06-03)


### Features

* observe coming along nicely ([cf88507](https://github.com/3mcd/javelin/commit/cf88507e0a615f613bb7dc5e86cf1b732b784cb8))
* patch encoding ([6f26b2f](https://github.com/3mcd/javelin/commit/6f26b2f750c152988931bad662f5bb23200c1905))
* track checkpoint ([b0d04bc](https://github.com/3mcd/javelin/commit/b0d04bc0837d030d0398f67a42f0c9efcb05a378))





# [1.0.0-alpha.4](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2021-05-24)


### Features

* attach model automatically ([ffee822](https://github.com/3mcd/javelin/commit/ffee822faeb4290f042d5fe38c3ebf07aa693e74))
* primitive model extensions ([5534c77](https://github.com/3mcd/javelin/commit/5534c77b40010580bf863bbf70ae53e73a19f93a))





# [1.0.0-alpha.3](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2021-05-23)


### Features

* model enhancements ([65bbe77](https://github.com/3mcd/javelin/commit/65bbe772b631bf06b71870348827c315c397fbc4))
* more api improvements ([6e4f27b](https://github.com/3mcd/javelin/commit/6e4f27b8e200ed49679e1512dccc1fea22010841))
* prefer function keyword; hrtime-loop accuracy improvements and api tweaks ([ade3c9a](https://github.com/3mcd/javelin/commit/ade3c9a219a90844abda31903a44a30f2812ea87))
* world generic improvement; simplify example ([1b70b4b](https://github.com/3mcd/javelin/commit/1b70b4be9f1946103cb409c946a941307bb27ba3))





# [1.0.0-alpha.2](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2021-05-18)


### Features

* remove spawn op; useMonitor reset only on query signature change ([56cab8d](https://github.com/3mcd/javelin/commit/56cab8d0b7d7fa214692d55b21b75c727fe64847))





# [1.0.0-alpha.1](https://github.com/3mcd/javelin/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2021-05-17)


### Bug Fixes

* **net:** nested arrayOfs in encoded model ([29b3779](https://github.com/3mcd/javelin/commit/29b3779feb91fe86b0a14232b060e9777a031418))





# [1.0.0-alpha.0](https://github.com/3mcd/javelin/compare/v0.22.0...v1.0.0-alpha.0) (2021-05-16)


### Features

* protocol rework + API overhaul ([#164](https://github.com/3mcd/javelin/issues/164)) ([053b1df](https://github.com/3mcd/javelin/commit/053b1dfc5972786b86d06339db8c6751a8dae6f4))





# [0.22.0](https://github.com/3mcd/javelin/compare/v0.21.2...v0.22.0) (2021-04-15)

**Note:** Version bump only for package @javelin/ecs





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
