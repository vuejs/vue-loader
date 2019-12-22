import { generateCodeFrame, CompilerError } from '@vue/compiler-sfc'
import chalk from 'chalk'

export function formatError(err: CompilerError, source: string, file: string) {
  if (err.loc) {
    const loc = `:${err.loc.start.line}:${err.loc.start.column}`
    const filePath = chalk.gray(`at ${file}${loc}`)
    const codeframe = generateCodeFrame(
      source,
      err.loc.start.offset,
      err.loc.end.offset
    )
    err.message = `\n${chalk.red(
      `VueCompilerError: ${err.message}`
    )}\n${filePath}\n${chalk.yellow(codeframe)}\n`
  }
}
