import * as fs from 'fs'
import type { SFCDescriptor } from '@vue/compiler-sfc'
import { compiler } from './compiler'

const cache = new Map<string, SFCDescriptor>()

export function setDescriptor(filename: string, entry: SFCDescriptor) {
  cache.set(cleanQuery(filename), entry)
}

export function getDescriptor(filename: string): SFCDescriptor {
  filename = cleanQuery(filename)
  if (cache.has(filename)) {
    return cache.get(filename)!
  }

  // This function should only be called after the descriptor has been
  // cached by the main loader.
  // If this is somehow called without a cache hit, it's probably due to sub
  // loaders being run in separate threads. The only way to deal with this is to
  // read from disk directly...
  const source = fs.readFileSync(filename, 'utf-8')
  const { descriptor } = compiler.parse(source, {
    filename,
    sourceMap: true,
  })
  cache.set(filename, descriptor)
  return descriptor
}

function cleanQuery(str: string) {
  const i = str.indexOf('?')
  return i > 0 ? str.slice(0, i) : str
}
