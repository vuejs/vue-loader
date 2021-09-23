import type { CompilerError } from '@vue/compiler-sfc'
import { compiler } from './compiler'
import chalk = require('chalk')

export function formatError(
  err: SyntaxError | CompilerError,
  source: string,
  file: string
) {
  const loc = (err as CompilerError).loc
  if (!loc) {
    return
  }
  const locString = `:${loc.start.line}:${loc.start.column}`
  const filePath = chalk.gray(`at ${file}${locString}`)
  const codeframe = compiler.generateCodeFrame(
    source,
    loc.start.offset,
    loc.end.offset
  )
  err.message = `\n${chalk.red(
    `VueCompilerError: ${err.message}`
  )}\n${filePath}\n${chalk.yellow(codeframe)}\n`
}
