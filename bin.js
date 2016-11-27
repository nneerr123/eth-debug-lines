#!/usr/bin/env node

const debugLines = require('./')
const stdin = require('get-stdin-promise')
const yargs = require('yargs')

const argv = yargs
  .usage(`Description:
  Injects DEBUG_LINE statements into Solidity source for line numbers in errors.

Example:
  $ eth-debug-lines < MyContract.sol`)
  .help()
  .version()
  .argv

stdin
  .then(src => debugLines(src, argv))
  .then(console.log)
  .catch(console.error)
