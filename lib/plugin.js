const fs = require('fs')
const path = require('path')
const qs = require('querystring')
const RuleSet = require('webpack/lib/RuleSet')

const id = 'vue-loader-plugin'
const NS = path.dirname(fs.realpathSync(__filename))

class VueLoaderPlugin {
  apply (compiler) {
    // add NS marker so that the loader can detect and report missing plugin
    if (compiler.hooks) {
      // webpack 4
      compiler.hooks.compilation.tap(id, compilation => {
        compilation.hooks.normalModuleLoader.tap(id, loaderContext => {
          loaderContext[NS] = true
        })
      })
    } else {
      // webpack < 4
      compiler.plugin('compilation', compilation => {
        compilation.plugin('normal-module-loader', loaderContext => {
          loaderContext[NS] = true
        })
      })
    }

    // get a hold of the raw rules
    const rawRules = compiler.options.module.rules.slice()
    // use webpack's RuleSet utility to normalize user rules
    const rawNormalizedRules = new RuleSet(rawRules).rules

    const createMatcher = fakeFile => (rule, i) => {
      // #1201 we need to skip the `include` check when locating the vue rule
      const clone = Object.assign({}, rule)
      delete clone.include
      const normalized = RuleSet.normalizeRule(clone, {}, '')
      return (
        !rule.enforce &&
        normalized.resource &&
        normalized.resource(fakeFile)
      )
    }

    // find the rule that applies to vue files
    let vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue`))
    if (vueRuleIndex < 0) {
      vueRuleIndex = rawRules.findIndex(createMatcher(`foo.vue.html`))
    }
    const vueRule = rawRules[vueRuleIndex]

    if (!vueRule) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching rule for .vue files found.\n` +
        `Make sure there is at least one root-level rule that matches .vue or .vue.html files.`
      )
    }

    if (vueRule.oneOf) {
      throw new Error(
        `[VueLoaderPlugin Error] vue-loader 15 currently does not support vue rules with oneOf.`
      )
    }

    // find the normalized version of the vue rule
    const normalizedVueRule = rawNormalizedRules[vueRuleIndex]
    // get the normlized "use" for vue files
    const normalizedVueUse = normalizedVueRule.use
    // get vue-loader options
    const vueLoaderUseIndex = normalizedVueUse.findIndex(u => {
      return /^vue-loader|(\/|\\)vue-loader/.test(u.loader)
    })

    if (vueLoaderUseIndex < 0) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching use for vue-loader is found.\n` +
        `Make sure the rule matching .vue files include vue-loader in its use.`
      )
    }

    // make sure vue-loader options has a known ident so that we can share
    // options by reference in the template-loader by using a ref query like
    // template-loader??vue-loader-options
    const ident = 'vue-loader-options'
    const vueLoaderUse = normalizedVueUse[vueLoaderUseIndex]
    // has options, just set ident
    if (vueLoaderUse.options) {
      vueLoaderUse.options.ident = ident
    } else {
      // user provided no options, but we must ensure the options is present
      // otherwise RuleSet throws error if no option for a given ref is found.
      if (vueRule.loader || vueRule.loaders) {
        vueRule.options = { ident }
      } else if (Array.isArray(vueRule.use)) {
        const use = vueRule.use[vueLoaderUseIndex]
        if (typeof use === 'string') {
          vueRule.use[vueLoaderUseIndex] = { loader: use, options: { ident }}
        } else {
          use.options = { ident }
        }
      } else if (typeof vueRule.use === 'string') {
        vueRule.use = [{ loader: vueRule.use, options: { ident }}]
      } else {
        throw new Error(
          `VueLoaderPlugin Error: this should not happen. Please open an issue ` +
          `with your webpack config.`
        )
      }
    }

    // get new rules without the vue rule
    const baseRules = rawRules.filter(r => r !== vueRule)
    const normalizedRules = rawNormalizedRules.filter(r => r !== normalizedVueRule)

    // for each user rule, inject a cloned rule by checking if the rule
    // matches the lang specified in the resourceQuery.
    rawRules.unshift.apply(rawRules, baseRules.map((rule, i) => {
      return cloneRule(rule, normalizedRules[i])
    }))

    // inject global pitcher (responsible for injecting template compiler
    // loader & CSS post loader)
    rawRules.unshift({
      loader: require.resolve('./loaders/pitcher'),
      resourceQuery: query => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null
      }
    })

    // replace original rules
    compiler.options.module.rules = rawRules
  }
}

function cloneRule (rule, normalizedRule) {
  // Assuming `test` and `resourceQuery` tests are executed in series and
  // synchronously (which is true based on RuleSet's implementation), we can
  // save the current resource being matched from `test` so that we can access
  // it in `resourceQuery`. This ensures when we use the normalized rule's
  // resource check, include/exclude are matched correctly.
  let currentResource
  const res = Object.assign({}, rule, {
    test: resource => {
      currentResource = resource
      return true
    },
    resourceQuery: query => {
      const parsed = qs.parse(query.slice(1))
      if (parsed.vue == null) {
        return false
      }
      const { resource, resourceQuery } = normalizedRule
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
    use: normalizedRule.use ? normalizedRule.use.map(cleanIdent) : undefined
  })

  // delete shorthand since we have normalized use
  delete res.loader
  delete res.loaders
  delete res.options

  // these are included in the normalized resource() check
  delete res.resource
  delete res.include
  delete res.exclude

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map((r, i) => {
      return cloneRule(r, normalizedRule.oneOf[i])
    })
  }

  return res
}

const reuseIdentWhitelist = [
  'css-loader',
  '(vue-)?style-loader',
  'postcss-loader',
  'extract-text-webpack-plugin',
  'mini-css-extract-plugin'
]

const reuseIdentPattern = new RegExp(`(${reuseIdentWhitelist.join('|')})`)

function cleanIdent (use) {
  if (use.ident) {
    if (reuseIdentPattern.test(use.loader)) {
      // Reuse options ident, so that imports from within css-loader would get the
      // exact same request prefixes, avoiding duplicated modules (#1199)
      use.options.ident = use.ident
    }
    delete use.ident
  }
  return use
}

VueLoaderPlugin.NS = NS
module.exports = VueLoaderPlugin
