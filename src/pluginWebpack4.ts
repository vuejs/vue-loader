import * as qs from 'querystring'
import type { Compiler, RuleSetRule } from 'webpack'
import type { VueLoaderOptions } from './'
import { clientCache, typeDepToSFCMap } from './resolveScript'
import fs = require('fs')
import { compiler as vueCompiler } from './compiler'
import { descriptorCache } from './descriptorCache'
import { needHMR } from './util'

const RuleSet = require('webpack/lib/RuleSet')

const id = 'vue-loader-plugin'
const NS = 'vue-loader'

// these types are no longer available in webpack 5
type RuleSetQuery = string | { [k: string]: any }
interface RuleSetLoader {
  loader?: string | undefined
  options?: RuleSetQuery | undefined
  ident?: string | undefined
  query?: RuleSetQuery | undefined
}

class VueLoaderPlugin {
  static NS = NS

  apply(compiler: Compiler) {
    // inject NS for plugin installation check in the main loader
    compiler.hooks.compilation.tap(id, (compilation) => {
      compilation.hooks.normalModuleLoader.tap(id, (loaderContext: any) => {
        loaderContext[NS] = true
      })
    })

    const rawRules = compiler.options.module!.rules
    // use webpack's RuleSet utility to normalize user rules
    const rules = new RuleSet(rawRules).rules as RuleSetRule[]

    // find the rule that applies to vue files
    let vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue`))
    if (vueRuleIndex < 0) {
      vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue.html`))
    }
    const vueRule = rules[vueRuleIndex]

    if (!vueRule) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching rule for .vue files found.\n` +
          `Make sure there is at least one root-level rule that matches .vue or .vue.html files.`
      )
    }

    if (vueRule.oneOf) {
      throw new Error(
        `[VueLoaderPlugin Error] vue-loader currently does not support vue rules with oneOf.`
      )
    }

    // get the normlized "use" for vue files
    const vueUse = vueRule.use as RuleSetLoader[]
    // get vue-loader options
    const vueLoaderUseIndex = vueUse.findIndex((u) => {
      // FIXME: this code logic is incorrect when project paths starts with `vue-loader-something`
      return /^vue-loader|(\/|\\|@)vue-loader/.test(u.loader || '')
    })

    if (vueLoaderUseIndex < 0) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching use for vue-loader is found.\n` +
          `Make sure the rule matching .vue files include vue-loader in its use.`
      )
    }

    const vueLoaderUse = vueUse[vueLoaderUseIndex]
    const vueLoaderOptions = (vueLoaderUse.options =
      vueLoaderUse.options || {}) as VueLoaderOptions

    // for each user rule (except the vue rule), create a cloned rule
    // that targets the corresponding language blocks in *.vue files.
    const clonedRules = rules.filter((r) => r !== vueRule).map(cloneRule)

    // rule for template compiler
    const templateCompilerRule = {
      loader: require.resolve('./templateLoader'),
      resourceQuery: (query: string) => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null && parsed.type === 'template'
      },
      options: {
        ident: vueLoaderUse.ident,
        ...vueLoaderOptions,
      },
    }

    // for each rule that matches plain .js/.ts files, also create a clone and
    // match it against the compiled template code inside *.vue files, so that
    // compiled vue render functions receive the same treatment as user code
    // (mostly babel)
    const matchesJS = createMatcher(`test.js`)
    const matchesTS = createMatcher(`test.ts`)
    const jsRulesForRenderFn = rules
      .filter((r) => r !== vueRule && (matchesJS(r) || matchesTS(r)))
      .map(cloneRuleForRenderFn)

    // pitcher for block requests (for injecting stylePostLoader and deduping
    // loaders matched for src imports)
    const pitcher = {
      loader: require.resolve('./pitcher'),
      resourceQuery: (query: string) => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null
      },
    }

    // replace original rules
    compiler.options.module!.rules = [
      pitcher,
      ...jsRulesForRenderFn,
      templateCompilerRule,
      ...clonedRules,
      ...rules,
    ]

    // 3.3 HMR support for imported types
    if (
      needHMR(vueLoaderOptions, compiler.options) &&
      vueCompiler.invalidateTypeCache
    ) {
      let watcher: any

      const WatchPack = require('watchpack')

      compiler.hooks.afterCompile.tap(id, (compilation) => {
        if (compilation.compiler === compiler) {
          // type-only imports can be tree-shaken and not registered as a
          // watched file at all, so we have to manually ensure they are watched.
          const files = [...typeDepToSFCMap.keys()]
          const oldWatcher = watcher
          watcher = new WatchPack({ aggregateTimeout: 0 })

          watcher.once(
            'aggregated',
            (changes: Set<string>, removals: Set<string>) => {
              for (const file of changes) {
                // bust compiler-sfc type dep cache
                vueCompiler.invalidateTypeCache(file)
                const affectedSFCs = typeDepToSFCMap.get(file)
                if (affectedSFCs) {
                  for (const sfc of affectedSFCs) {
                    // bust script resolve cache
                    const desc = descriptorCache.get(sfc)
                    if (desc) clientCache.delete(desc)
                    // force update importing SFC
                    fs.writeFileSync(sfc, fs.readFileSync(sfc, 'utf-8'))
                  }
                }
              }
              for (const file of removals) {
                vueCompiler.invalidateTypeCache(file)
              }
            }
          )

          watcher.watch({ files, startTime: Date.now() })

          if (oldWatcher) {
            oldWatcher.close()
          }
        }
      })

      compiler.hooks.watchClose.tap(id, () => {
        if (watcher) {
          watcher.close()
        }
      })

      // In some cases, e.g. in this project's tests,
      // even though needsHMR() returns true, webpack is not watching, thus no watchClose hook is called.
      // So we need to close the watcher when webpack is done.
      compiler.hooks.done.tap(id, () => {
        if (watcher) {
          watcher.close()
        }
      })
    }
  }
}

function createMatcher(fakeFile: string) {
  return (rule: RuleSetRule) => {
    // #1201 we need to skip the `include` check when locating the vue rule
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')
    return !rule.enforce && normalized.resource && normalized.resource(fakeFile)
  }
}

function cloneRule(rule: RuleSetRule) {
  const resource = rule.resource as Function
  const resourceQuery = rule.resourceQuery as Function
  // Assuming `test` and `resourceQuery` tests are executed in series and
  // synchronously (which is true based on RuleSet's implementation), we can
  // save the current resource being matched from `test` so that we can access
  // it in `resourceQuery`. This ensures when we use the normalized rule's
  // resource check, include/exclude are matched correctly.
  let currentResource: string
  const res = {
    ...rule,
    resource: (resource: string) => {
      currentResource = resource
      return true
    },
    resourceQuery: (query: string) => {
      const parsed = qs.parse(query.slice(1))
      if (parsed.vue == null) {
        return false
      }
      if (resource && parsed.lang == null) {
        return false
      }
      const fakeResourcePath = `${currentResource}.${parsed.lang}`
      if (resource && !resource(fakeResourcePath)) {
        return false
      }
      if (resourceQuery && !resourceQuery(query)) {
        return false
      }
      return true
    },
  }

  if (rule.rules) {
    res.rules = rule.rules.map(cloneRule)
  }

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map(cloneRule)
  }

  return res
}

function cloneRuleForRenderFn(rule: RuleSetRule) {
  const resource = rule.resource as Function
  const resourceQuery = rule.resourceQuery as Function
  let currentResource: string
  const res = {
    ...rule,
    resource: (resource: string) => {
      currentResource = resource
      return true
    },
    resourceQuery: (query: string) => {
      const parsed = qs.parse(query.slice(1))
      if (parsed.vue == null || parsed.type !== 'template') {
        return false
      }
      const fakeResourcePath = `${currentResource}.${parsed.ts ? `ts` : `js`}`
      if (resource && !resource(fakeResourcePath)) {
        return false
      }
      if (resourceQuery && !resourceQuery(query)) {
        return false
      }
      return true
    },
  }

  if (rule.rules) {
    res.rules = rule.rules.map(cloneRuleForRenderFn)
  }

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map(cloneRuleForRenderFn)
  }

  return res
}

export default VueLoaderPlugin
