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

    // get new rules without the vue rule
    const baseRules = rawRules.filter(r => r !== vueRule)
    const normalizedRules = rawNormalizedRules.filter(r => r !== normalizedVueRule)

    // construct a new rule for vue file, with oneOf containing
    // multiple rules with dynamic resourceQuery functions that applies to
    // different language blocks in a raw vue file.
    const constructedRule = {
      test: /\.vue$/,
      oneOf: baseRules.map((rule, i) => {
        // for each user rule, create a cloned rule by checking if the rule
        // matches the lang specified in the resourceQuery.
        return cloneRule(rule, normalizedRules[i], normalizedVueUse)
      }).concat(vueRule)
    }

    // replace the original vue rule with our new constructed rule.
    rawRules.splice(vueRuleIndex, 1, constructedRule)

    // inject global pitcher (responsible for injecting template compiler
    // loader & CSS post loader)
    rawRules.unshift({
      loader: require.resolve('./pitch')
    })
  }
}

function cloneRule (rule, normalizedRule, vueUse) {
  if (rule.oneOf) {
    return Object.assign({}, rule, {
      oneOf: rule.oneOf.map((r, i) => cloneRule(r, normalizedRule.oneOf[i]))
    })
  }

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
      if (parsed.lang == null) {
        return false
      }
      return normalizedRule.resource(`${currentResource}.${parsed.lang}`)
    },
    use: [
      ...(normalizedRule.use || []).map(cleanUse),
      ...vueUse
    ]
  })

  // delete shorthand since we have normalized use
  delete res.loader
  delete res.options

  return res
}

// "ident" is exposed on normalized uses, delete in case it
// interferes with another normalization
function cleanUse (use) {
  const res = Object.assign({}, use)
  delete res.ident
  return res
}
