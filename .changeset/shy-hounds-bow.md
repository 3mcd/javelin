---
"@javelin/core": patch
"@javelin/ecs": patch
"@javelin/hrtime-loop": patch
"@javelin/net": patch
"@javelin/pack": patch
---

This release renames the effect option `global` to `shared`, and fixes a bug in `MessageProducer` where removed components were recreated on the client via update operations.
