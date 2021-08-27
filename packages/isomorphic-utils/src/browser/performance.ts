const universal = typeof globalThis !== "undefined" ? globalThis : global
const performance = universal.performance

export { performance }
