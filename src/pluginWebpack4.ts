import qs from 'querystring'
import webpack from 'webpack'
import { VueLoaderOptions } from './'

const RuleSet = require('webpack/lib/RuleSet')

const id = 'vue-loader-plugin'
const NS = 'vue-loader'

class VueLoaderPlugin implements webpack.Plugin {
  static NS = NS

  apply(compiler: webpack.Compiler) {
    // inject NS for plugin installation check in the main loader
    compiler.hooks.compilation.tap(id, compilation => {
      compilation.hooks.normalModuleLoader.tap(id, (loaderContext: any) => {
        loaderContext[NS] = true
      })
    })

    const rawRules = compiler.options.module!.rules
    // use webpack's RuleSet utility to normalize user rules
    const rules = new RuleSet(rawRules).rules as webpack.RuleSetRule[]

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
    const vueUse = vueRule.use as webpack.RuleSetLoader[]
    // get vue-loader options
    const vueLoaderUseIndex = vueUse.findIndex(u => {
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

    // for each user rule (expect the vue rule), create a cloned rule
    // that targets the corresponding language blocks in *.vue files.
    const clonedRules = rules.filter(r => r !== vueRule).map(cloneRule)

    // rule for template compiler
    const templateCompilerRule = {
      loader: require.resolve('./templateLoader'),
      resourceQuery: (query: string) => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null && parsed.type === 'template'
      },
      options: vueLoaderOptions
    }

    // for each rule that matches plain .js files, also create a clone and
    // match it against the compiled template code inside *.vue files, so that
    // compiled vue render functions receive the same treatment as user code
    // (mostly babel)
    const matchesJS = createMatcher(`test.js`)
    const jsRulesForRenderFn = rules
      .filter(r => r !== vueRule && matchesJS(r))
      .map(cloneRuleForRenderFn)

    // pitcher for block requests (for injecting stylePostLoader and deduping
    // loaders matched for src imports)
    const pitcher = {
      loader: require.resolve('./pitcher'),
      resourceQuery: (query: string) => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null
      }
    }

    // replace original rules
    compiler.options.module!.rules = [
      pitcher,
      ...jsRulesForRenderFn,
      templateCompilerRule,
      ...clonedRules,
      ...rules
    ]
  }
}

function createMatcher(fakeFile: string) {
  return (rule: webpack.RuleSetRule) => {
    // #1201 we need to skip the `include` check when locating the vue rule
    const clone = Object.assign({}, rule)
    delete clone.include
    const normalized = RuleSet.normalizeRule(clone, {}, '')
    return !rule.enforce && normalized.resource && normalized.resource(fakeFile)
  }
}

function cloneRule(rule: webpack.RuleSetRule) {
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
    }
  }

  if (rule.rules) {
    res.rules = rule.rules.map(cloneRule)
  }

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map(cloneRule)
  }

  return res
}

function cloneRuleForRenderFn(rule: webpack.RuleSetRule) {
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
      const fakeResourcePath = `${currentResource}.js`
      if (resource && !resource(fakeResourcePath)) {
        return false
      }
      if (resourceQuery && !resourceQuery(query)) {
        return false
      }
      return true
    }
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
