import {assert, expect, Maybe} from "@javelin/lib"
import {dim, gray, green, red, underline, white, yellow} from "colorette"
import {createReadStream} from "node:fs"
import {writeFile} from "node:fs/promises"
import {createInterface} from "node:readline"

let toInt = (s: Maybe<string>) => (s == undefined ? undefined : +s)

const defaultPerfOptions: Readonly<PerfOptions> = Object.freeze({
  only: false,
  throwOnFailure: true,
})
const PERF_RUNS = toInt(process.env.PERF_RUNS) ?? 15_000
const PERF_SAMPLES_TO_DISCARD_PER_EXTREME =
  toInt(process.env.PERF_SAMPLES_TO_DISCARD_PER_EXTREME) ?? 100
const MODULE_RESULTS_EXTENSION =
  process.env.MODULE_RESULTS_EXTENSION ?? ".perf-results"
const MODULE_EXTENSION = ".perf.ts"

class PerformanceError extends Error {
  name = "PerformanceError"
}

type PerfOptions = {
  only: boolean
  throwOnFailure: boolean
}

type Perf = {
  name: string
  impl: Function
  currMeanRunMs: Maybe<number>
  prevMeanRunMs: Maybe<number>
  options: PerfOptions
}

let formatOpsPerS = (run_ms: number) =>
  `${(1_000 / run_ms).toLocaleString().split(".")[0]} ops/s`
let formatPerfDeviation = (perfDeviation: number) =>
  (perfDeviation > 0 ? " " : "") + (perfDeviation * 100).toFixed(2)

let makePerf = (
  perfName: string,
  perfImpl: Function,
  perfOptions: Partial<PerfOptions> = {},
): Perf => {
  return {
    name: perfName,
    impl: perfImpl,
    currMeanRunMs: null,
    prevMeanRunMs: null,
    options: Object.assign({}, defaultPerfOptions, perfOptions),
  }
}

type ModuleMode = "all" | "only"

type Module = {
  name: string
  path: string
  mode: ModuleMode
  perfs: Map<string, Perf>
  resultsPath: string
  resultsContent: string
}

let getModuleResultsPath = (modulePath: string) =>
  modulePath
    .slice(0, modulePath.lastIndexOf(MODULE_EXTENSION))
    .replace("file://", "")
    .concat(MODULE_RESULTS_EXTENSION)

let getModuleName = (modulePath: string) =>
  modulePath.slice(modulePath.lastIndexOf("/") + 1, modulePath.indexOf("."))

let makeModule = (modulePath: string): Module => {
  let resultsPath = getModuleResultsPath(modulePath)
  return {
    name: getModuleName(modulePath),
    path: modulePath,
    mode: "all",
    perfs: new Map(),
    resultsPath,
    resultsContent: "",
  }
}

let getCallingModulePath = (): string => {
  let prepareStackTrace = Error.prepareStackTrace
  let file: Maybe<string>
  try {
    let error = new Error()
    let currentFile
    Error.prepareStackTrace = function (_, stack) {
      return stack
    }
    // @ts-expect-error
    currentFile = error.stack!.shift().getFileName()
    while (error.stack!.length) {
      // @ts-expect-error
      file = error.stack.shift().getFileName()
      if (currentFile !== file) break
    }
  } catch (_) {}
  Error.prepareStackTrace = prepareStackTrace
  return expect(file)
}

let runPerfImpl = (perfImpl: Function, perfImplSetup: Maybe<Function>) => {
  if (perfImplSetup != undefined) {
    perfImpl = perfImplSetup()
  }
  let start = performance.now()
  perfImpl()
  return performance.now() - start
}

let formatError = (text: string) => underline(red(text))

let getFormatLineStyle = (perfDeviation: number, label = false) => {
  let absPerfDeviation = Math.abs(perfDeviation)
  if (perfDeviation < -0.15) {
    return formatError
  }
  if (perfDeviation < -0.1) {
    return yellow
  }
  if (perfDeviation > 0.1) {
    return green
  }
  if (label) {
    return absPerfDeviation > 0.01 ? white : gray
  }
  return absPerfDeviation > 0.01 ? gray : dim
}

let runPerf = (perf: Perf, module: Module, perfLabel: string) => {
  let perfSuccess = true
  let perfImplSetup: Maybe<Function>
  if (perf.impl() instanceof Function) {
    perfImplSetup = perf.impl
  }
  let perfSamples: number[] = []
  let perfImpl = perf.impl
  // warmup
  for (let i = 0; i < PERF_RUNS; i++) {
    runPerfImpl(perfImpl, perfImplSetup)
  }
  // run
  for (let i = 0; i < PERF_RUNS; i++) {
    perfSamples.push(runPerfImpl(perfImpl, perfImplSetup))
  }
  let perfSampleTotalMs = 0
  perfSamples.sort()
  for (
    let i = PERF_SAMPLES_TO_DISCARD_PER_EXTREME;
    i < perfSamples.length - PERF_SAMPLES_TO_DISCARD_PER_EXTREME;
    i++
  ) {
    perfSampleTotalMs += perfSamples[i]
  }
  let currMeanRunMs =
    perfSampleTotalMs / (PERF_RUNS - PERF_SAMPLES_TO_DISCARD_PER_EXTREME * 2)
  perf.currMeanRunMs = currMeanRunMs
  let perfFormattedOpsPerSecond = formatOpsPerS(currMeanRunMs).padEnd(16)
  if (module.mode === "only" && !perf.options.only) {
    module.resultsContent += `${perf.name},${perf.currMeanRunMs}\n`
    return true
  }
  if (perf.prevMeanRunMs == undefined) {
    console.log(` ${perfLabel} ${gray(`${perfFormattedOpsPerSecond} =  0.00`)}`)
    module.resultsContent += `${perf.name},${currMeanRunMs}\r\n`
  } else {
    let perfDelta = perf.prevMeanRunMs - currMeanRunMs
    let perfDeviation = perfDelta / perf.prevMeanRunMs
    if (perfDeviation < -0.1) {
      if (perfDeviation < -0.15) {
        perfSuccess = false
        module.resultsContent += `${perf.name},${perf.prevMeanRunMs}\r\n`
      } else {
        module.resultsContent += `${perf.name},${currMeanRunMs}\r\n`
      }
    } else if (perfDeviation > 0.1) {
      module.resultsContent += `${perf.name},${currMeanRunMs}\r\n`
    } else {
      module.resultsContent += `${perf.name},${perf.prevMeanRunMs}\r\n`
    }
    let formatLine = getFormatLineStyle(perfDeviation)
    let formatLabel = getFormatLineStyle(perfDeviation, true)
    console.log(
      ` ${formatLabel(perfLabel + " ")}${formatLine(
        `${perfFormattedOpsPerSecond} ${
          perfDeviation > 0.1 ? "+" : perfDeviation > -0.1 ? "=" : "-"
        }  ${formatPerfDeviation(perfDeviation)}`,
      )}`,
    )
  }
  return perf.options.throwOnFailure ? perfSuccess : true
}

let hydrateModule = async (module: Module) => {
  for (let [perfName, perf] of module.perfs) {
    let moduleResultsStream = createReadStream(module.resultsPath, {
      flags: "a+",
    })
    let moduleResultsLines = createInterface({
      input: moduleResultsStream,
      crlfDelay: Infinity,
    })
    for await (let line of moduleResultsLines) {
      let [resultName, resultRunMsString] = line.split(",")
      if (resultName === perfName) {
        perf.prevMeanRunMs = Number(resultRunMsString)
      }
    }
  }
}

let runBenchmark = async () => {
  let benchmarkSuccess = true
  // hydrate modules
  await Promise.all(Array.from(modules.values()).map(hydrateModule))
  // run perfs
  for (let [, module] of modules) {
    let longestPerfNameLength = Array.from(module.perfs.keys()).reduce(
      (a, perfName) => Math.max(perfName.length, a),
      8,
    )
    let path = module.path
      .replace(process.cwd(), "")
      .replace("file://", "")
      .replace(/^\//, "")
    let pathFileIndex = path.lastIndexOf("/") + 1
    let pathExtensionIndex = path.indexOf(".")
    console.log(
      dim(path.slice(0, pathFileIndex)) +
        path.slice(pathFileIndex, pathExtensionIndex) +
        dim(path.slice(pathExtensionIndex)),
    )
    console.log("")
    for (let [, perf] of module.perfs) {
      let perfSuccess = runPerf(
        perf,
        module,
        perf.name.padEnd(longestPerfNameLength),
      )
      if (perfSuccess === false) {
        benchmarkSuccess = false
      }
    }
    console.log("")
    await writeFile(module.resultsPath, module.resultsContent, {
      encoding: "utf-8",
    })
  }
  modules.clear()
  if (benchmarkSuccess === false) {
    throw new PerformanceError()
  }
}

let modules = new Map<string, Module>()

interface PerfFactory {
  (
    perfName: string,
    perfImpl: Function,
    perfOptions?: Partial<PerfOptions>,
  ): void
  only(
    perfName: string,
    perfImpl: Function,
    perfOptions?: Partial<PerfOptions>,
  ): void
}

export let perf = ((
  perfName: string,
  perfImpl: Function,
  perfOptions?: Partial<PerfOptions>,
) => {
  let modulePath = getCallingModulePath()
  let module = modules.get(modulePath)
  if (module === undefined) {
    module = makeModule(modulePath)
    modules.set(modulePath, module)
  }
  assert(
    !module.perfs.has(perfName),
    `duplicate perf name within ${module.name}`,
  )
  let perf = makePerf(perfName, perfImpl, perfOptions)
  if (perf.options.only) {
    module.mode = "only"
  }
  module.perfs.set(perfName, perf)
}) as unknown as PerfFactory

perf.only = (
  perfName: string,
  perfImpl: Function,
  perfOptions?: Partial<PerfOptions>,
) => perf(perfName, perfImpl, {...perfOptions, only: true})

setTimeout(runBenchmark, 0)
