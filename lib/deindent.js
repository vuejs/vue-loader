// For some reason, if a script code block has a base indent
// level, the eval-source-map gets messed up. So we have to
// manually deindent script code blocks here.

var splitRE = /\r?\n/g
var emptyRE = /^\s*$/

module.exports = function deindent (str) {
  var lines = str.split(splitRE)
  var min = Infinity
  var type, cur, c
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!emptyRE.test(line)) {
      if (!type) {
        c = line.charAt(0)
        if (c === ' ' || c === '\t') {
          type = c
        } else {
          return str
        }
      } else {
        cur = count(line, type)
        if (cur < min) {
          min = cur
        }
      }
    }
  }
  return lines.map(function (line) {
    return line.slice(min)
  }).join('\n')
}

function count (line, type) {
  var i = 0
  while (line.charAt(i) === type) {
    i++
  }
  return i
}
