# Template Specification

Vue.js uses an HTML-based template syntax that allows you to declaratively bind the rendered DOM to the underlying Vue instance’s data. All Vue.js templates are valid HTML that can be parsed by spec-compliant browsers and HTML parsers.

For usage guide, please see the [template syntax documentation](https://vuejs.org/v2/guide/syntax.html).

## Overview

The purpose of this specification is to define syntax structure of template language. A well defined
specification enables community to create tools like parsers, syntax highlighters etc.

## Syntax

The template document must include following parts, in the given order:

- Any number of [comments](https://html.spec.whatwg.org/multipage/syntax.html#syntax-comments) and [ASCII whitespace](https://infra.spec.whatwg.org/#ascii-whitespace)
- An [element](#elements)
- Any number of [comments](https://html.spec.whatwg.org/multipage/syntax.html#syntax-comments) and [ASCII whitespace](https://infra.spec.whatwg.org/#ascii-whitespace)

### Elements

The element section is extension of [HTML Element](https://html.spec.whatwg.org/multipage/syntax.html#elements-2). The element section in template adds following condition:

- Disallows usage of `style` and `script` [raw text elements](https://html.spec.whatwg.org/multipage/syntax.html#raw-text-elements).
- [Attributes](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2) include special kind of attributes called [directives](#directives)
- Text can include [interpolation](#interpolation)

### Directives

The directive is extension syntax of [attributes](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2). 
Directives for an element are expressed inside the element's start tag.

It must include following parts:

- Directive [name or longhand](#directive-name) or [shorthand](#directive-shorthand)
- Optional [argument](#directive-argument) with `:` prefix if used with longhand syntax
- Any number of [modifiers](#directive-modifiers)
- Optional [value](#directive-value)

There different kinds of directives:

- Custom Directives:
- Builtin Directives:
  - [v-for](#for-directive)
  - [v-if](#if-directive)
  - [v-slot](#slot-directive)

#### Directive Name

The directive name has same syntax as [attribute name](https://html.spec.whatwg.org/multipage/syntax.html#syntax-attribute-name) with a constraint that it must hav `v-` prefix. The directive name includes builtin directives and custom directives defined by end user.

#### Directive Shorthand

The directive shorthand is single character replacement for directive name. Shorthand syntax is defined for some of builtin directives and custom directives cannot have shorthand.

Directive | Shorthand  |
----------|:----------:|
`v-bind`  | `:`        |
`v-on`    | `@`        |
`v-slot`  | `#`        |

#### Directive Argument

The directive argument can be specified in two different ways:

##### Static Directive Argument

The static argument is an alpha numeric case insensitive string.

##### Dynamic Directive Argument

The dynamic directive argument must include following parts:

- The string `[`
- A JavaScript expression which must not include following characters:
  - `\t` (tab)
  - `\r` (carriage return)
  - `\n` (new lint)
  - `\f` (form feed)
  - (space)
  - `]` (closing square bracket)
  - `/>` or `>`
- The string `]`
