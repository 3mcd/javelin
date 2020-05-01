const hr = Array(40).fill("=").join("")

const perfs = [
  { name: "perf_storage", run: require("./perf_storage").run },
  { name: "perf_storage_pooled", run: require("./perf_storage_pooled").run },
]

perfs.forEach(p => {
  console.log(hr)
  console.log(p.name)
  console.log(hr)
  p.run()
})
