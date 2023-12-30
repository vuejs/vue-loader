import * as fs from 'fs'
import type { CompilerOptions, SFCDescriptor } from 'vue/compiler-sfc'
import { compiler } from './compiler'

const { parse } = compiler
export const descriptorCache = new Map<string, SFCDescriptor>()

export function setDescriptor(filename: string, entry: SFCDescriptor) {
  descriptorCache.set(cleanQuery(filename), entry)
}

export function getDescriptor(
  filename: string,
  compilerOptions?: CompilerOptions
): SFCDescriptor {
  filename = cleanQuery(filename)
  if (descriptorCache.has(filename)) {
    return descriptorCache.get(filename)!
  }

  // This function should only be called after the descriptor has been
  // cached by the main loader.
  // If this is somehow called without a cache hit, it's probably due to sub
  // loaders being run in separate threads. The only way to deal with this is to
  // read from disk directly...
  const source = fs.readFileSync(filename, 'utf-8')
  const { descriptor } = parse(source, {
    filename,
    sourceMap: true,
    templateParseOptions: compilerOptions,
  })
  descriptorCache.set(filename, descriptor)
  return descriptor
}

function cleanQuery(str: string) {
  const i = str.indexOf('?')
  return i > 0 ? str.slice(0, i) : str
}
