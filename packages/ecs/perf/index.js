const hr = Array(40).fill("=").join("")

const perfs = [
  { name: "perf", run: require("./perf").run },
  { name: "perf_move", run: require("./perf_move").run },
]

perfs.forEach(p => {
  console.log(hr)
  console.log(p.name)
  console.log(hr)
  p.run()
})
