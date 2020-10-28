import qs from 'querystring'
import { VueLoaderOptions } from './'
import { RuleSetRule, Compiler, Plugin } from 'webpack'

const id = 'vue-loader-plugin'
const NS = 'vue-loader'

const NormalModule = require('webpack/lib/NormalModule')
const BasicEffectRulePlugin = require('webpack/lib/rules/BasicEffectRulePlugin')
const BasicMatcherRulePlugin = require('webpack/lib/rules/BasicMatcherRulePlugin')
const UseEffectRulePlugin = require('webpack/lib/rules/UseEffectRulePlugin')
const RuleSetCompiler = require('webpack/lib/rules/RuleSetCompiler') as RuleSetCompiler

type RawRule = RuleSetRule

// webpack 5 doesn't export the internal Rule types so we have to shim it here
// (hopefully it will do in the future)
type RuleSetCompiler = {
  new (plugins: any): {
    compile(rawRules: RawRule[]): RuleSet
    compileRule(
      path: string,
      rawRule: RawRule,
      refs: Map<string, any>
    ): CompiledRule
  }
}

interface RuleSet {
  references: Map<string, any>
  exec(data: object): Effect[]
}

interface CompiledRule {
  conditions: RuleCondition[]
  effects: Effect[]
  rules: CompiledRule[]
  oneOf: CompiledRule[]
}

interface RuleCondition {
  property: string
  matchWhenEmpty: boolean
  fn(input: string): boolean
}

interface BasicEffect {
  type: 'type' | 'sideEffects' | 'parser' | 'resolve'
  value: any
}

interface UseEffect {
  type: 'use'
  value: {
    loader: string
    options: any
    ident: string
  }
}

type Effect = BasicEffect | UseEffect

const ruleSetCompiler = new RuleSetCompiler([
  new BasicMatcherRulePlugin('test', 'resource'),
  new BasicMatcherRulePlugin('include', 'resource'),
  new BasicMatcherRulePlugin('exclude', 'resource', true),
  new BasicMatcherRulePlugin('resource'),
  new BasicMatcherRulePlugin('conditions'),
  new BasicMatcherRulePlugin('resourceQuery'),
  new BasicMatcherRulePlugin('realResource'),
  new BasicMatcherRulePlugin('issuer'),
  new BasicMatcherRulePlugin('compiler'),
  new BasicEffectRulePlugin('type'),
  new BasicEffectRulePlugin('sideEffects'),
  new BasicEffectRulePlugin('parser'),
  new BasicEffectRulePlugin('resolve'),
  new BasicEffectRulePlugin('generator'),
  new UseEffectRulePlugin(),
])

class VueLoaderPlugin implements Plugin {
  static NS = NS

  apply(compiler: Compiler) {
    // add NS marker so that the loader can detect and report missing plugin
    compiler.hooks.compilation.tap(id, (compilation) => {
      NormalModule.getCompilationHooks(compilation).loader.tap(
        id,
        (loaderContext: any) => {
          loaderContext[NS] = true
        }
      )
    })

    const rules = compiler.options.module!.rules
    let rawVueRule: RawRule
    let vueRules: Effect[] = []

    for (const rawRule of rules) {
      // skip rules with 'enforce'. eg. rule for eslint-loader
      if (rawRule.enforce) {
        continue
      }
      vueRules = match(rawRule, 'foo.vue')
      if (!vueRules.length) {
        vueRules = match(rawRule, 'foo.vue.html')
      }
      if (vueRules.length > 0) {
        if (rawRule.oneOf) {
          throw new Error(
            `[VueLoaderPlugin Error] vue-loader currently does not support vue rules with oneOf.`
          )
        }
        rawVueRule = rawRule
        break
      }
    }
    if (!vueRules.length) {
      throw new Error(
        `[VueLoaderPlugin Error] No matching rule for .vue files found.\n` +
          `Make sure there is at least one root-level rule that matches .vue or .vue.html files.`
      )
    }

    // get the normlized "use" for vue files
    const vueUse = vueRules
      .filter((rule) => rule.type === 'use')
      .map((rule) => rule.value)

    // get vue-loader options
    const vueLoaderUseIndex = vueUse.findIndex((u) => {
      return /^vue-loader|(\/|\\|@)vue-loader/.test(u.loader)
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
    const vueLoaderUse = vueUse[vueLoaderUseIndex]
    const vueLoaderOptions = (vueLoaderUse.options =
      vueLoaderUse.options || {}) as VueLoaderOptions

    // for each user rule (expect the vue rule), create a cloned rule
    // that targets the corresponding language blocks in *.vue files.
    const refs = new Map()
    const clonedRules = rules
      .filter((r) => r !== rawVueRule)
      .map((rawRule) =>
        cloneRule(rawRule, refs, langBlockRuleCheck, langBlockRuleResource)
      )

    // fix conflict with config.loader and config.options when using config.use
    delete rawVueRule!.loader
    delete rawVueRule!.options
    rawVueRule!.use = vueUse

    // rule for template compiler
    const templateCompilerRule = {
      loader: require.resolve('./templateLoader'),
      resourceQuery: (query: string) => {
        const parsed = qs.parse(query.slice(1))
        return parsed.vue != null && parsed.type === 'template'
      },
      options: vueLoaderOptions,
    }

    // for each rule that matches plain .js files, also create a clone and
    // match it against the compiled template code inside *.vue files, so that
    // compiled vue render functions receive the same treatment as user code
    // (mostly babel)
    const jsRulesForRenderFn = rules
      .filter((r) => r !== rawVueRule && match(r, 'test.js').length > 0)
      .map((rawRule) => cloneRule(rawRule, refs, jsRuleCheck, jsRuleResource))

    // global pitcher (responsible for injecting template compiler loader & CSS
    // post loader)
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
  }
}

const matcherCache = new WeakMap<RawRule, RuleSet>()

function match(rule: RawRule, fakeFile: string): Effect[] {
  let ruleSet = matcherCache.get(rule)
  if (!ruleSet) {
    // skip the `include` check when locating the vue rule
    const clonedRawRule = { ...rule }
    delete clonedRawRule.include

    ruleSet = ruleSetCompiler.compile([clonedRawRule])
    matcherCache.set(rule, ruleSet)
  }

  return ruleSet.exec({
    resource: fakeFile,
  })
}

const langBlockRuleCheck = (
  query: qs.ParsedUrlQuery,
  rule: CompiledRule
): boolean => {
  return !rule.conditions.length || query.lang != null
}

const langBlockRuleResource = (
  query: qs.ParsedUrlQuery,
  resource: string
): string => `${resource}.${query.lang}`

const jsRuleCheck = (query: qs.ParsedUrlQuery): boolean => {
  return query.lang === 'template'
}

const jsRuleResource = (query: qs.ParsedUrlQuery, resource: string): string =>
  `${resource}.js`

let uid = 0

function cloneRule(
  rawRule: RawRule,
  refs: Map<string, any>,
  ruleCheck: (query: qs.ParsedUrlQuery, rule: CompiledRule) => boolean,
  ruleResource: (query: qs.ParsedUrlQuery, resource: string) => string
): RawRule {
  const compiledRule = ruleSetCompiler.compileRule(
    `clonedRuleSet-${++uid}`,
    rawRule,
    refs
  )

  // do not process rule with enforce
  if (!rawRule.enforce) {
    const ruleUse = compiledRule.effects
      .filter((effect) => effect.type === 'use')
      .map((effect: UseEffect) => effect.value)
    // fix conflict with config.loader and config.options when using config.use
    delete rawRule.loader
    delete rawRule.options
    rawRule.use = ruleUse
  }

  let currentResource: string
  const res = {
    ...rawRule,
    resource: (resources: string) => {
      currentResource = resources
      return true
    },
    resourceQuery: (query: string) => {
      const parsed = qs.parse(query.slice(1))
      if (parsed.vue == null) {
        return false
      }
      if (!ruleCheck(parsed, compiledRule)) {
        return false
      }
      const fakeResourcePath = ruleResource(parsed, currentResource)
      for (const condition of compiledRule.conditions) {
        // add support for resourceQuery
        const request =
          condition.property === 'resourceQuery' ? query : fakeResourcePath
        if (condition && !condition.fn(request)) {
          return false
        }
      }
      return true
    },
  }

  delete res.test

  if (rawRule.rules) {
    res.rules = rawRule.rules.map((rule) =>
      cloneRule(rule, refs, ruleCheck, ruleResource)
    )
  }

  if (rawRule.oneOf) {
    res.oneOf = rawRule.oneOf.map((rule) =>
      cloneRule(rule, refs, ruleCheck, ruleResource)
    )
  }

  return res
}

export default VueLoaderPlugin
