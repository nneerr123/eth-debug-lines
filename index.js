const SolidityParser = require('solidity-parser')
const path = require('path')
const fs = require('fs')

// since the parser currently parser modifiers into the same heap as constant, public, private, etc, we need to whitelist these
const notModifiers = {
  'constant': 1,
  'payable': 1,
  'public': 1,
  'private': 1,   // redundant: private functions get filtered out before modifiers are filtered
  'internal': 1,  // redundant: internal functions get filtered out before modifiers are filtered
  'returns': 1
}

/** Returns true if the given ast statement is a function. */
function isFunction(statement) {
  return statement.type === 'FunctionDeclaration'
}

/** Returns true if the given ast statement is an expression. */
function isExpression(statement) {
  return statement.type === 'ExpressionStatement'
}

/** Gets the index of the line of the given index. */
function getLineIndex(src, index) {
  return src.lastIndexOf('\n', index)
}

/** Gets the index of the line of the given index. */
function getLineNumber(src, index) {
  return src.slice(0, index).split('\n').length
}

function injectDebugLines(src, options = {}) {

  // parse contract
  const ast = SolidityParser.parse(src)

  // // get contract name
  const contract = ast.body.find(statement => statement.type === 'ContractStatement')

  // get all expressions in all functions
  const expressions = contract.body ? contract.body
    // get functions
    .filter(isFunction)
    // get expressions
    .map(f => f.body.body.filter(isExpression))
    // flatten
    .reduce((arr, item) => arr.concat(item), [])
    : []

  // generate source for the DebugLine event
  const eventSource = '\n\n  // INJECTED\n  event DebugLine(uint line);\n';
  const contractBodyStart = getLineIndex(src, contract.body[0].start)
  const srcWithEvent = src.slice(0, contractBodyStart) + eventSource + src.slice(contractBodyStart)

  const newSource = expressions.reduce((accum, exp) => {

    const lineIndex = getLineIndex(accum.src, exp.start + accum.offset)
    const lineNumber = getLineNumber(src, exp.start)
    const insertion = `\nDebugLine(${lineNumber});`

    return {
      src: accum.src.slice(0, lineIndex) + insertion + accum.src.slice(lineIndex),
      offset: accum.offset + insertion.length
    }
  }, { src: srcWithEvent, offset: eventSource.length })
  .src

  return newSource
}

module.exports = injectDebugLines
