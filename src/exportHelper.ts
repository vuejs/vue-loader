// runtime helper for setting properties on components
// in a tree-shakable way
export default (sfc: any, props: [string, string][]) => {
  for (const [key, val] of props) {
    sfc[key] = val
  }
  return sfc
}
