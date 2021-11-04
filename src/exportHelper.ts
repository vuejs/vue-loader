// runtime helper for setting properties on components
// in a tree-shakable way
export default (sfc: any, props: [string, string][]) => {
  const target = sfc.__vccOpts || sfc
  for (const [key, val] of props) {
    target[key] = val
  }
  return target
}
