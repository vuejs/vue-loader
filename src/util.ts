import { SFCDescriptor, CompilerOptions } from '@vue/compiler-sfc'

export function resolveTemplateTSOptions(
  descriptor: SFCDescriptor,
  options: CompilerOptions | null | undefined
): CompilerOptions {
  const lang = descriptor.script?.lang || descriptor.scriptSetup?.lang
  const isTS = !!(lang && /tsx?$/.test(lang))
  let expressionPlugins = (options && options.expressionPlugins) || []
  if (isTS && !expressionPlugins.includes('typescript')) {
    expressionPlugins = [...expressionPlugins, 'typescript']
  }
  return {
    isTS,
    expressionPlugins,
  }
}
