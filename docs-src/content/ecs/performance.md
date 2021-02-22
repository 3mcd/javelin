+++
title = "Performance"
weight = 9
+++

## Iteration

Javelin stores components in tables called **archetypes**. An archetype contains components of entities that share the exact same composition. This array of archetypes acts as an index that allow us to skip entire swathes of entities that don't match a query's selector. For example, when querying for entities with components `(A, B)`, we can skip iteration of entities within all archetypes that aren't superset of `(A, B)`.

Performance is highly dependent on your game's archetype makeup and logic. However, in a simple benchmark that iterates and performs basic arithmetic on four component types across six archetypes, Javelin can achieve (at 60Hz):

- ~600k iterations per tick on a 2GHz Intel i5 processor (2020 Macbook Pro 13-inch)
- ~900k iterations per tick on a 3.79 GHz AMD processor (Ryzen 3900XT)

You can see how archtypes and component storage are implemented in [archetype.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/archetype.ts) and [storage.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/storage.ts), respectively.

### Resources

- [Specs and Legion, two very different approaches to ECS ](https://csherratt.github.io/blog/posts/specs-and-legion/) by [Cora Sherratt](https://github.com/csherratt)
- [Building an ECS #2: Archetypes and Vectorization
  ](https://medium.com/@ajmmertens/building-an-ecs-2-archetypes-and-vectorization-fe21690805f9) by [Sander Mertens](https://github.com/SanderMertens)
- [Memory in Javascript— Beyond Leaks](https://medium.com/walkme-engineering/memory-in-javascript-beyond-leaks-8c1d697c655c) by [Yonatan Kra](https://github.com/yonatankra)

## Memory

Javelin ECS aims to achieve a small memory / GC footprint. Below is a screenshot of an allocation timeline where 10k entities are iterated by 3 systems per tick at 60Hz. The memory growth (0.3mb) is consistent with standard `setInterval` or `requestAnimationFrame` performance and there is no "sawtooth" pattern of frequent, minor GC events.

**Simple `requestAnimationFrame` loop**
![](/perf-raf.png)

**Simple `requestAnimationFrame` loop @ 10k entities/tick**
![](/perf-raf-ecs.png)

A custom iterator is implemented in [query.ts](https://github.com/3mcd/javelin/blob/master/packages/ecs/src/query.ts) which re-uses the same iterable instance for each query execution. Upgrading to a handwritten iterator from generator functions doubled the speed of iteration and eliminated ~5kb/s worth of garbage accumulation.

## Performance Tests

Run the performance tests by cloning the repository and running `yarn perf`:

```bash
git clone https://github.com/3mcd/javelin
cd javelin
yarn && yarn:perf
```

Example `yarn perf` output:

```
========================================
perf_storage
========================================
create: 401.421ms
run: 16.899s
destroy: 106.127ms
entities      | 855000
components    | 4
queries       | 4
ticks         | 1000
iter          | 997500000
iter_tick     | 997500
avg_tick      | 17.474ms
```
