var e,
  t,
  n = Object.defineProperty,
  o = Object.defineProperties,
  r = Object.getOwnPropertyDescriptors,
  c = Object.getOwnPropertySymbols,
  i = Object.prototype.hasOwnProperty,
  s = Object.prototype.propertyIsEnumerable,
  l = (e, t, o) =>
    t in e
      ? n(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o })
      : (e[t] = o),
  a = (e, t) => {
    for (var n in t || (t = {})) i.call(t, n) && l(e, n, t[n])
    if (c) for (var n of c(t)) s.call(t, n) && l(e, n, t[n])
    return e
  },
  u = (e, t) => o(e, r(t))
import {
  W as f,
  P as d,
  O as p,
  S as h,
  a as y,
  V as m,
  A as g,
  D as b,
  B as v,
  b as w,
  c as S,
  M as I,
  d as k,
} from "./vendor.js"
function x(e, t = "", n) {
  if (!e) throw new Error(void 0 !== n ? `${O[n]}: ${t}` : t)
}
;((t = e || (e = {}))[(t.Internal = 0)] = "Internal"),
  (t[(t.Query = 1)] = "Query")
const O = { [e.Internal]: "Internal Error", [e.Query]: "Query Error" },
  C = Symbol("javelin_field_kind"),
  T = Symbol("javelin_model_flat")
var j, E
function q(e) {
  for (; e.length > 0; ) e.pop()
  return e
}
;((E = j || (j = {}))[(E.Number = 0)] = "Number"),
  (E[(E.String = 1)] = "String"),
  (E[(E.Boolean = 2)] = "Boolean"),
  (E[(E.Array = 3)] = "Array"),
  (E[(E.Object = 4)] = "Object"),
  (E[(E.Set = 5)] = "Set"),
  (E[(E.Map = 6)] = "Map"),
  (E[(E.Dynamic = 7)] = "Dynamic")
const A = { [C]: j.Number, get: () => 0 }
function D(e) {
  return C in e
}
function B(e, t, n = []) {
  let o,
    r = { id: t.id, lo: t.id, hi: t.id, deep: n.length > 0, traverse: n }
  if ((t.id++, D(e)))
    (o = a(a({}, r), e)),
      "element" in o &&
        (o.element = B(o.element, t, "key" in o ? [...n, o.key] : n))
  else {
    const c = Object.keys(e),
      i = [],
      s = [],
      l = {},
      f = {}
    for (let o = 0; o < c.length; o++) {
      const r = c[o],
        a = B(e[r], t, n)
      ;(i[a.id] = r), (l[r] = a), (f[r] = a.id), s.push(a)
    }
    o = u(a({}, r), {
      keys: c,
      keysByFieldId: i,
      fields: s,
      fieldsByKey: l,
      fieldIdsByKey: f,
    })
  }
  return (o.hi = t.id), o
}
function W(e, t) {
  if (((t[e.id] = e), D(e))) "element" in e && W(e.element, t)
  else for (let n = 0; n < e.fields.length; n++) W(e.fields[n], t)
}
function P(e) {
  const t = {}
  for (const n in e) W(e[n], (t[n] = {}))
  return t
}
function z(e) {
  const t = {}
  return (
    e.forEach((e, n) => (t[n] = B(e, { id: 0 }))),
    Object.defineProperty(t, T, { enumerable: !1, writable: !1, value: P(t) })
  )
}
function F(e, t = {}) {
  for (const n in e) {
    const o = e[n]
    let r
    ;(r = D(o) ? o.get() : F({}, o)), (t[n] = r)
  }
  return t
}
function M(e, t) {
  for (const n in t) {
    const o = t[n]
    D(o) ? (e[n] = o.get(e[n])) : M(e[n], o)
  }
  return e
}
function _(e, t, n) {
  const o = [],
    r = () => {
      for (let t = 0; t < n; t++) o.push(e(c))
    },
    c = {
      allocate: r,
      retain: () => (o.length || r(), o.pop()),
      release: e => {
        o.push(t(e))
      },
    }
  return c
}
j.String, j.Boolean
const N = () => {
    const e = []
    return {
      subscribe: t => (
        e.push(t),
        () =>
          (function (e, t) {
            const n = e.length,
              o = e.indexOf(t)
            if (-1 === o) return !1
            const r = e.pop()
            return o < n - 1 && (e[o] = r), !0
          })(e, t)
      ),
      dispatch: (t, n, o, r) => {
        for (let c = 0; c < e.length; c++) e[c](t, n, o, r)
      },
    }
  },
  Q = {
    instanceTypeLookup: new WeakMap(),
    model: { [T]: {} },
    schemaIndex: new WeakMap(),
    schemaPools: new Map(),
    worlds: [],
    currentWorldId: -1,
    worldIds: 0,
  },
  R = N()
const $ = Symbol("javelin_component_type"),
  L = Symbol("javelin_component_pool"),
  { schemaIndex: H, schemaPools: K, instanceTypeLookup: U } = Q
let G = 0
function V(e, t) {
  return _(
    () =>
      F(
        e,
        (function (e, t = !0) {
          return Object.defineProperties(
            {},
            {
              [$]: { value: H.get(e), writable: !1, enumerable: !1 },
              [L]: { value: t, writable: !1, enumerable: !1 },
            },
          )
        })(e),
      ),
    t => M(t, e),
    t,
  )
}
const Y = new Map()
function J(e, t, n = 1e3) {
  let o = H.get(e)
  if (void 0 !== o) return o
  if (((o = t), void 0 === o)) {
    for (; Y.has(G); ) G++
    o = G
  } else if (Y.has(o))
    throw new Error(
      "Failed to register component type: a component with same id is already registered",
    )
  var r
  return (
    n > 0 && K.set(o, V(e, n)),
    Y.set(o, e),
    H.set(e, o),
    (r = z(Y)),
    (Q.model = r),
    R.dispatch(r),
    o
  )
}
function X(e, t) {
  try {
    ;(e[$] = t), (e[L] = !1)
  } catch {}
  return e[$] !== t && U.set(e, t), e
}
function Z(e, t) {
  return X(e, J(t, void 0, 0))
}
function ee(e) {
  var t
  const n = null !== (t = e[$]) && void 0 !== t ? t : U.get(e)
  if (void 0 === n)
    throw new Error(
      "Failed to get component type id: object is not a component",
    )
  return n
}
function te(e, t = { shared: !1 }) {
  const { shared: n } = t,
    o = []
  let r,
    c,
    i,
    s,
    l,
    a = -1
  return function (...t) {
    s = Q.currentWorldId
    const u = Q.worlds[s],
      f = u.latestTick
    l = n ? 0 : u.latestSystemId
    let d = o[s]
    void 0 === o[s] && (d = o[s] = [])
    let p = d[l]
    if (
      (void 0 === p && (p = d[l] = { cells: [], cellCount: -1 }),
      !0 === n || (c !== s && void 0 !== c))
    )
      a = 0
    else if (void 0 === i || (r === f && i === l)) a++
    else {
      let e = d[i]
      if (-1 !== e.cellCount && e.cellCount !== a)
        throw new Error(
          `Failed to execute effect: encountered too ${
            e.cellCount > a ? "few" : "many"
          } effects this step`,
        )
      ;(e.cellCount = a), (a = 0)
    }
    let h = p.cells[a]
    if (
      (h ||
        (h = p.cells[a] =
          {
            executor: e(u),
            lockShare: !1,
            lockAsync: !1,
            lockShareTick: null,
            state: null,
          }),
      n &&
        (h.lockShareTick !== u.latestTick
          ? ((h.lockShare = !1), (h.lockShareTick = u.latestTick))
          : (h.lockShare = !0)),
      h.lockShare || h.lockAsync)
    )
      return h.state
    const y = h.executor(...t)
    var m
    return (
      "object" == typeof (m = y) && null !== m && "then" in m
        ? ((h.lockAsync = !0),
          y
            .then(e => (h.state = e))
            .catch(e =>
              console.error(`Uncaught error in effect: ${e.message}`, e),
            )
            .then(() => (h.lockAsync = !1)))
        : (h.state = y),
      (r = f),
      (c = s),
      (i = l),
      h.state
    )
  }
}
const ne = te(() => {
  let e = !0
  const t = { value: null }
  return function (n) {
    return e && ((t.value = n), (e = !1)), t
  }
})
function oe() {
  const e = ne(!0),
    t = e.value
  return (e.value = !1), t
}
const re = _(
    () => [-1, [], []],
    e => ((e[0] = -1), q(e[1]), q(e[2]), e),
    1e3,
  ),
  ce = te(e => {
    const {
        storage: {
          entityRelocating: t,
          entityRelocated: n,
          archetypes: [o],
        },
      } = e,
      r = new Set()
    let c = [],
      i = [],
      s = [],
      l = [],
      a = null
    return (
      t.subscribe(function (e, t, n, s) {
        if (null === a) return
        const l = r.has(e),
          u = a.matchesType(t.type),
          f = a.matchesType(n.type)
        if (!(u && (!f || n === o))) return
        if (l) {
          const t = c.findIndex(([t]) => t === e)
          return (
            x(-1 !== t),
            void (function (e, t) {
              const n = e.length
              if (-1 === t) return !1
              const o = e.pop()
              t < n - 1 && (e[t] = o)
            })(c, t)
          )
        }
        const d = re.retain()
        ;(d[0] = e), a.get(e, d[1]), a.match(s, d[2]), i.push(d)
      }),
      n.subscribe(function (e, t, n, o) {
        if (null === a) return
        const i = a.matchesType(t.type),
          s = a.matchesType(n.type)
        if (!i && s) {
          const t = re.retain()
          ;(t[0] = e), a.get(e, t[1]), a.match(o, t[2]), c.push(t), r.add(e)
        }
      }),
      function (e, t, n) {
        let o
        for (
          a === e ||
            (null == a ? void 0 : a.equals(e)) ||
            (e => {
              ;(a = e), q(c), q(i), q(s), q(l)
              for (const [t] of e)
                for (let n = 0; n < t.length; n++) {
                  const o = t[n],
                    r = re.retain()
                  ;(r[0] = o), e.get(o, r[1]), e.get(o, r[2]), c.push(r)
                }
            })(e),
            q(s),
            q(l);
          void 0 !== (o = c.pop());

        )
          s.push(o)
        for (; void 0 !== (o = i.pop()); ) l.push(o)
        if ((r.clear(), void 0 !== t))
          for (let r = 0; r < s.length; r++) {
            const e = s[r]
            t(e[0], e[1], e[2]), re.release(e)
          }
        if (void 0 !== n)
          for (let r = 0; r < l.length; r++) {
            const e = l[r]
            n(e[0], e[1], e[2]), re.release(e)
          }
      }
    )
  })
function ie(e) {
  return e.slice().sort((e, t) => e - t)
}
const se =
  "a query must be executed within a system or bound to a world using Query.bind()"
function le(e, t, n) {
  return (
    (function (e, t) {
      let n = 0,
        o = 0
      if (e.length < t.length) return !1
      for (; n < e.length && o < t.length; )
        if (e[n] < t[o]) n++
        else {
          if (e[n] !== t[o]) return !1
          n++, o++
        }
      return o === t.length
    })(t, e) && t.every(e => !n.not.has(e))
  )
}
function ae(t) {
  var n, o
  const r = t.select.length,
    c = null !== (n = t.filters) && void 0 !== n ? n : { not: new Set() },
    i = ie(t.select.map(e => J(e))),
    s = (null !== (o = t.include) && void 0 !== o ? o : t.select).map(e =>
      J(e),
    ),
    l = [],
    f = _(
      () => [],
      e => (q(e), e),
      1e3,
    )
  let d = t.boundWorldId
  function p(e, t) {
    if (le(i, e.type, c)) {
      const n = s.map(t => e.table[e.type.indexOf(t)])
      t.push([e.entities, n, e.indices])
    }
  }
  function h(e) {
    const t = Q.worlds[e],
      n = []
    return (
      (l[e] = n),
      t.storage.archetypes.forEach(e => p(e, n)),
      t.storage.archetypeCreated.subscribe(e => p(e, n)),
      n
    )
  }
  let y = i
  const m = function (t) {
    const n = null != d ? d : Q.currentWorldId
    x(null !== n && -1 !== n, se, e.Query)
    const o = l[n] || h(n),
      c = f.retain()
    for (let e = 0; e < o.length; e++) {
      const [n, i] = o[e]
      for (let e = 0; e < n.length; e++) {
        for (let t = 0; t < r; t++) c[t] = i[t][e]
        t(n[e], c)
      }
    }
    f.release(c)
  }
  return (
    (m[Symbol.iterator] = function () {
      const t = null != d ? d : Q.currentWorldId
      return (
        x(null !== t && -1 !== t, se, e.Query),
        (l[t] || h(t))[Symbol.iterator]()
      )
    }),
    (m.type = i),
    (m.filters = c),
    (m.not = function (...e) {
      return ae(
        u(a({}, t), {
          filters: {
            not: new Set(
              e
                .map(e => Q.schemaIndex.get(e))
                .filter(e => "number" == typeof e),
            ),
          },
        }),
      )
    }),
    (m.select = function (...e) {
      return ae(u(a({}, t), { include: e }))
    }),
    (m.get = function (e, t = []) {
      const n = null != d ? d : Q.currentWorldId,
        o = l[n]
      for (let r = 0; r < o.length; r++) {
        const [, n, c] = o[r],
          i = c[e]
        if (void 0 !== i) {
          for (let e = 0; e < n.length; e++) t[e] = n[e][i]
          return t
        }
      }
      throw new Error(
        "Failed to get components of query: entity does not match query",
      )
    }),
    (m.bind = function (e) {
      return ae(u(a({}, t), { boundWorldId: e.id }))
    }),
    (m.test = function (e) {
      const t = null != d ? d : Q.currentWorldId,
        n = l[t]
      for (let o = 0; o < n.length; o++) {
        if (void 0 !== n[o][2][e]) return !0
      }
      return !1
    }),
    (m.matchesType = function (e) {
      return le(y, e, c)
    }),
    (m.equals = function (e) {
      if (e.type.length !== i.length) return !1
      for (let n = 0; n < e.type.length; n++) if (e.type[n] !== i[n]) return !1
      if (e.filters.not.size !== c.not.size) return !1
      let t = !0
      return e.filters.not.forEach(e => (t = t && c.not.has(e))), t
    }),
    (m.match = function (e, t = []) {
      for (let n = 0; n < s.length; n++) t[n] = null
      for (let n = 0; n < e.length; n++) {
        const o = e[n],
          r = s.indexOf(ee(o))
        ;-1 !== r && (t[r] = o)
      }
      return t
    }),
    m
  )
}
function ue(e) {
  const t = Object.keys(e.indices).map(Number),
    n = (function (e) {
      const t = []
      for (const n in e) {
        const o = parseInt(n, 10)
        isNaN(o) || (t[o] = e[n])
      }
      return t
    })(e.indices),
    o = ie(e.type)
  return {
    entities: t,
    indices: n,
    type: o,
    table: (function (e, t) {
      return e.map((e, n) => {
        const o = t[n]
        return e.slice().map(e => X(e, o))
      })
    })(e.table, o),
  }
}
function fe(e) {
  const {
      table: t,
      indices: n,
      entities: o,
      type: r,
    } = (function (e) {
      if ("snapshot" in e) return ue(e.snapshot)
      const t = ie(e.type),
        n = t.map(() => [])
      return { entities: [], indices: [], type: t, table: n }
    })(e),
    c = r.reduce((e, t, n) => ((e[t] = n), e), [])
  return {
    entities: o,
    indices: n,
    insert: function (e, r) {
      for (let n = 0; n < r.length; n++) {
        const e = r[n],
          o = c[ee(e)]
        t[o].push(e)
      }
      n[e] = o.push(e) - 1
    },
    remove: function (e) {
      const r = o.length,
        c = n[e],
        i = o.pop()
      if ((delete n[e], c === r - 1)) for (const n of t) n.pop()
      else {
        for (const e of t) e[c] = e.pop()
        ;(o[c] = i), (n[i] = c)
      }
    },
    type: r,
    typeInverse: c,
    table: t,
  }
}
const de = "Failed to locate component: schema not registered"
function pe(e = {}) {
  const t = e.snapshot
      ? e.snapshot.archetypes.map(e => fe({ snapshot: e }))
      : [fe({ type: [] })],
    n = [],
    o = N(),
    r = N(),
    c = N()
  function i(e) {
    let n = (function (e) {
      const n = e.length
      e: for (let o = 0; o < t.length; o++) {
        const r = t[o],
          { type: c, typeInverse: i } = r
        if (c.length === n) {
          for (let t = 0; t < n; t++) if (void 0 === i[ee(e[t])]) continue e
          return r
        }
      }
      return null
    })(e)
    return (
      null === n && ((n = fe({ type: e.map(ee) })), t.push(n), c.dispatch(n)), n
    )
  }
  function s(e) {
    const t = n[e]
    return (
      x(void 0 !== t, "Failed to locate entity: entity has not been created"),
      x(null !== t, "Failed to locate entity: entity has been destroyed"),
      t
    )
  }
  function l(e, t, c, s) {
    const l = i(c)
    o.dispatch(t, e, l, s),
      e.remove(t),
      l.insert(t, c),
      (n[t] = l),
      r.dispatch(t, e, l, s)
  }
  function u(e, c) {
    const s = n[e]
    if (null == s) {
      const s = i(c)
      o.dispatch(e, t[0], s, c),
        s.insert(e, c),
        (n[e] = s),
        r.dispatch(e, t[0], s, c)
    } else {
      const t = s.indices[e],
        n = c.slice()
      for (let e = 0; e < s.type.length; e++) {
        const o = s.type[e]
        c.find(e => ee(e) === o) || n.push(s.table[e][t])
      }
      l(s, e, n, c)
    }
  }
  function f(e, t) {
    const n = s(e),
      o = [],
      r = [],
      c = n.indices[e]
    for (let i = 0; i < n.type.length; i++) {
      const e = n.type[i],
        s = n.table[i][c]
      ;(t.includes(e) ? o : r).push(s)
    }
    l(n, e, r, o)
  }
  const d = []
  function p(e, t) {
    const n = s(e),
      o = n.typeInverse[t]
    if (void 0 === o) return null
    const r = n.indices[e]
    return n.table[o][r]
  }
  return {
    archetypeCreated: c,
    archetypes: t,
    attachComponents: u,
    attachOrUpdateComponents: function (e, t) {
      const n = s(e),
        o = n.indices[e]
      q(d)
      for (let r = 0; r < t.length; r++) {
        const e = t[r],
          c = n.typeInverse[ee(e)]
        void 0 === c ? d.push(e) : Object.assign(n.table[c][o], e)
      }
      d.length > 0 && u(e, d)
    },
    clear: function () {
      q(t), q(n)
    },
    clearComponents: function (e) {
      f(e, s(e).type), (n[e] = null)
    },
    detachBySchemaId: f,
    entityRelocated: r,
    entityRelocating: o,
    getComponentBySchemaId: p,
    getComponentBySchema: function (e, t) {
      const n = Q.schemaIndex.get(t)
      return x(void 0 !== n, de), p(e, n)
    },
    getAllComponents: function (e) {
      const t = s(e),
        n = t.indices[e],
        o = []
      for (let r = 0; r < t.table.length; r++) o.push(t.table[r][n])
      return o
    },
    createSnapshot: function () {
      return {
        archetypes: t.map(e => {
          return {
            type: e.type.slice(),
            table: e.table.map(e => e.map(e => a({}, e))),
            indices:
              ((t = e.indices), t.reduce((e, t, n) => ((e[n] = t), e), {})),
          }
          var t
        }),
      }
    },
    hasComponentOfSchema: function (e, t) {
      const n = s(e),
        o = Q.schemaIndex.get(t)
      return x(void 0 !== o, de), n.type.includes(o)
    },
  }
}
const he = Symbol("javelin_system_id")
var ye, me
;((me = ye || (ye = {}))[(me.Create = 0)] = "Create"),
  (me[(me.Attach = 1)] = "Attach"),
  (me[(me.Detach = 2)] = "Detach"),
  (me[(me.Destroy = 3)] = "Destroy")
const ge = { x: A, y: A, z: A },
  be = { x: A, y: A, z: A, w: A },
  ve = { position: ge, quaternion: be },
  we = { position: ge, quaternion: be },
  Se = new f({ antialias: !0, canvas: document.getElementById("game") }),
  Ie = new d(45, 1, 0.1, 2e6),
  ke = new p(Ie, Se.domElement),
  xe = new h(),
  Oe = new y({ gravity: new m(0, -9.81, 0) })
function Ce() {
  ;(Ie.aspect = window.innerWidth / window.innerHeight),
    Ie.updateProjectionMatrix(),
    Se.setSize(window.innerWidth, window.innerHeight)
}
function Te(
  e = new m(0, 0, 0),
  t = new m(0.5, 0.5, 0.5),
  n = v.DYNAMIC,
  o = 16711680,
  r = 1,
) {
  const c = new w(t),
    i = new v({ mass: r, type: n, position: e, shape: c }),
    s = new S(2 * t.x, 2 * t.y, 2 * t.z),
    l = new I({ color: o }),
    a = new k(s, l)
  return [Z(i, ve), Z(a, we)]
}
function je(e = 2) {
  return (0.5 - Math.random()) * e
}
xe.add(new g(4210752), new b(16777215, 0.5)),
  window.addEventListener("resize", Ce, !1),
  Ce()
const Ee = (function (e = {}) {
    var t, n
    const { topics: o = [] } = e,
      r = [],
      c = [],
      i = new Set(),
      s = pe({
        snapshot:
          null === (t = e.snapshot) || void 0 === t ? void 0 : t.storage,
      })
    let l = 0,
      a = 0
    function u(...e) {
      const t = []
      for (let n = 0; n < e.length; n++) t[n] = e[n]
      return t
    }
    function f(e) {
      const t = Q.schemaPools.get(ee(e))
      t && Reflect.get(e, L) && t.release(e)
    }
    function d(e) {
      r.push(e), (e[he] = a++)
    }
    function p(e, t) {
      s.attachComponents(e, t)
    }
    function h(e, t) {
      const n = []
      for (let o = 0; o < t.length; o++) {
        const r = t[o],
          c = s.getComponentBySchemaId(e, r)
        x(
          null !== c,
          `Failed to detach component: entity does not have component of type ${r}`,
        ),
          n.push(c)
      }
      s.detachBySchemaId(e, t), n.forEach(f)
    }
    function y(e) {
      s.clearComponents(e)
    }
    function m(e) {
      switch (e[0]) {
        case ye.Attach:
          !(function (e) {
            const [, t, n] = e
            p(t, n)
          })(e)
          break
        case ye.Detach:
          !(function (e) {
            const [, t, n] = e
            h(t, n)
          })(e)
          break
        case ye.Destroy:
          !(function (e) {
            const [, t] = e
            y(t)
          })(e)
      }
    }
    null === (n = e.systems) || void 0 === n || n.forEach(d)
    const g = Q.worldIds++,
      b = {
        id: g,
        storage: s,
        latestTick: -1,
        latestTickData: null,
        latestSystemId: -1,
        attach: function (e, ...t) {
          c.push(u(ye.Attach, e, t))
        },
        attachImmediate: p,
        addSystem: d,
        addTopic: function (e) {
          o.push(e)
        },
        create: function (...e) {
          const t = l++
          return e.length > 0 && c.push(u(ye.Attach, t, e)), t
        },
        destroy: function (e) {
          i.has(e) || (c.push(u(ye.Destroy, e)), i.add(e))
        },
        destroyImmediate: y,
        get: function (e, t) {
          J(t)
          const n = s.getComponentBySchema(e, t)
          if (null === n)
            throw new Error(
              "Failed to get component: entity does not have component",
            )
          return n
        },
        createSnapshot: function () {
          return { storage: s.createSnapshot() }
        },
        has: function (e, t) {
          return J(t), s.hasComponentOfSchema(e, t)
        },
        detach: function (e, ...t) {
          if (0 === t.length) return
          const n = t.map(e => {
            var t
            return "number" == typeof e
              ? e
              : null !== (t = Q.schemaIndex.get(e)) && void 0 !== t
              ? t
              : ee(e)
          })
          c.push(u(ye.Detach, e, n))
        },
        detachImmediate: h,
        removeSystem: function (e) {
          const t = r.indexOf(e)
          t > -1 && r.splice(t, 1)
        },
        removeTopic: function (e) {
          const t = o.indexOf(e)
          t > -1 && o.splice(t, 1)
        },
        reset: function () {
          i.clear(),
            q(c),
            q(r),
            o.forEach(e => e.clear()),
            q(o),
            (l = 0),
            (b.latestTick = -1),
            (b.latestTickData = null),
            (b.latestSystemId = -1)
          for (let e = 0; e < s.archetypes.length; e++) {
            const t = s.archetypes[e]
            for (let e = 0; e < t.type.length; e++) {
              const n = t.table[e],
                o = Q.schemaPools.get(t.type[e])
              for (let e = 0; e < n.length; e++) {
                const t = n[e]
                null == o || o.release(t)
              }
            }
          }
          s.clear()
        },
        step: function (e) {
          let t = Q.currentWorldId
          ;(Q.currentWorldId = g), (b.latestTickData = e)
          for (let n = 0; n < c.length; n++) m(c[n])
          q(c)
          for (let n = 0; n < o.length; n++) o[n].flush()
          for (let n = 0; n < r.length; n++) {
            const e = r[n]
            ;(b.latestSystemId = e[he]), e(b)
          }
          i.clear(), b.latestTick++, (Q.currentWorldId = t)
        },
        tryGet: function (e, t) {
          return J(t), s.getComponentBySchema(e, t)
        },
      }
    return Q.worlds.push(b), b
  })(),
  qe = (function (...e) {
    return ae({ select: e })
  })(ve, we)
Ee.addSystem(function ({ create: e }) {
  if (oe()) {
    e(...Te(new m(0, 0, 0), new m(10, 0.1, 10), v.STATIC, 16777215, 0))
    for (let t = 0; t < 200; t++) e(...Te(new m(je(20), 20, je(20))))
  }
}),
  Ee.addSystem(function ({ latestTickData: e }) {
    ce(qe, (e, [t]) => {
      Oe.addBody(t)
    }),
      Oe.step(e / 1e3)
  }),
  Ee.addSystem(function () {
    oe() &&
      (xe.add(Ie),
      (Ie.position.x = 50),
      (Ie.position.y = 50),
      (Ie.position.z = 50)),
      ce(qe, (e, [, t]) => xe.add(t)),
      qe((e, [t, n]) =>
        (function (e, t) {
          ;(t.position.x = e.position.x),
            (t.position.y = e.position.y),
            (t.position.z = e.position.z),
            (t.quaternion.x = e.quaternion.x),
            (t.quaternion.y = e.quaternion.y),
            (t.quaternion.z = e.quaternion.z),
            (t.quaternion.w = e.quaternion.w)
        })(t, n),
      ),
      ke.update(),
      Se.render(xe, Ie)
  })
let Ae = 0
requestAnimationFrame(function e(t) {
  Ee.step(t - (Ae || t)), requestAnimationFrame(e), (Ae = t)
})
