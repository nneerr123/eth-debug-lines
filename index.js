const SolidityParser = require('solidity-parser')
const path = require('path')
const fs = require('fs')

// checks ast statement types
const isFunction = statement => statement.type === 'FunctionDeclaration'
const isExpression = statement => statement.type === 'ExpressionStatement' || statement.type === 'ThrowStatement'
const isContractOrLibrary = statement => statement.type === 'ContractStatement' || statement.type === 'LibraryStatement'

/** Gets the index of the line of the given index. */
const getLineIndex = (src, index) => src.lastIndexOf('\n', index)

/** Gets the index of the line of the given index. */
const getLineNumber = (src, index) => src.slice(0, index).split('\n').length

function injectDebugLines(src, options = {}) {

  // parse contract
  const ast = SolidityParser.parse(src)

  // // get contract name
  const contract = ast.body.find(isContractOrLibrary)

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
  const eventSource = 'event DebugLine(uint line); ';
  const contractBodyStart = contract.body[0].start || contract.body[0][0].start
  const srcWithEvent = src.slice(0, contractBodyStart) + eventSource + src.slice(contractBodyStart)

  const newSource = expressions.reduce((accum, exp) => {

    const lineNumber = getLineNumber(src, exp.start)
    const insertion = `DebugLine(${lineNumber}); `
    const insertionIndex = exp.start + accum.offset

    return {
      src: accum.src.slice(0, insertionIndex) + insertion + accum.src.slice(insertionIndex),
      offset: accum.offset + insertion.length
    }
  }, { src: srcWithEvent, offset: eventSource.length })
  .src

  return newSource
}

module.exports = injectDebugLines
