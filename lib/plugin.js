const qs = require('querystring')
const RuleSet = require('webpack/lib/RuleSet')

// TODO handle vueRule with oneOf
module.exports = class VueLoaderPlugin {
  apply (compiler) {
    // get a hold of the raw rules
    const rawRules = compiler.options.module.rules
    // use webpack's RuleSet utility to normalize user rules
    const rawNormalizedRules = new RuleSet(rawRules).rules

    // find the rule that applies to vue files
    const vueRuleIndex = rawRules.findIndex((rule, i) => {
      return !rule.enforce && rawNormalizedRules[i].resource(`foo.vue`)
    })
    const vueRule = rawRules[vueRuleIndex]

    if (!vueRule) {
      throw new Error(
        `VueLoaderPlugin Error: no matching rule for vue files are found.`
      )
    }

    // find the normalized version of the vue rule
    const normalizedVueRule = rawNormalizedRules[vueRuleIndex]
    // get the normlized "use" for vue files
    const normalizedVueUse = normalizedVueRule.use.map(cleanUse)
    // get vue-loader options
    const vueLoaderUseIndex = normalizedVueUse.findIndex(u => {
      return /^vue-loader|\/vue-loader/.test(u.loader)
    })

    if (vueLoaderUseIndex < 0) {
      throw new Error(
        `VueLoaderPlugin Error: no matching use for vue-loader is found.`
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
      } else if (vueRule.use) {
        const use = vueRule.use[vueLoaderUseIndex]
        if (typeof use === 'string') {
          vueRule.use[vueLoaderUseIndex] = { loader: use, options: { ident }}
        } else {
          use.options = { ident }
        }
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

    const customFallbackRule = {
      loader: require.resolve('./loaders/noop'),
      resourceQuery: /type=custom/
    }

    // construct a new rule for vue file, with oneOf containing
    // multiple rules with dynamic resourceQuery functions that applies to
    // different language blocks in a raw vue file.
    const constructedRule = {
      test: /\.vue$/,
      oneOf: baseRules.map((rule, i) => {
        // for each user rule, create a cloned rule by checking if the rule
        // matches the lang specified in the resourceQuery.
        return cloneRule(rule, normalizedRules[i], normalizedVueUse)
      }).concat(customFallbackRule, vueRule)
    }

    // replace the original vue rule with our new constructed rule.
    rawRules.splice(vueRuleIndex, 1, constructedRule)

    // inject global pitcher (responsible for injecting template compiler
    // loader & CSS post loader)
    rawRules.unshift({
      loader: require.resolve('./loaders/pitch')
    })
  }
}

function cloneRule (rule, normalizedRule, vueUse) {
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
      const { resource, resourceQuery } = normalizedRule
      if (resource && parsed.lang == null) {
        return false
      }
      const fakeResourcePath = `${currentResource.replace(/\.vue$/, '')}.${parsed.lang}`
      if (resource && !resource(fakeResourcePath)) {
        return false
      }
      if (resourceQuery && !resourceQuery(query)) {
        return false
      }
      return true
    },
    use: [
      ...(normalizedRule.use || []).map(cleanUse),
      ...rule.oneOf ? [] : vueUse
    ]
  })

  // delete shorthand since we have normalized use
  delete res.loader
  delete res.options

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map((r, i) => {
      return cloneRule(r, normalizedRule.oneOf[i], vueUse)
    })
  }

  return res
}

// "ident" is exposed on normalized uses, delete in case it
// interferes with another normalization
function cleanUse (use) {
  const res = Object.assign({}, use)
  delete res.ident
  return res
}
