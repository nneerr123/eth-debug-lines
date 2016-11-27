# eth-debug-lines
[![npm version](https://img.shields.io/npm/v/eth-debug-lines.svg)](https://npmjs.org/package/eth-debug-lines)

Injects Solidity source code with DebugLine events to allow per-line error reporting.

## Install

```sh
$ npm install --save eth-debug-lines
```

## CLI Usage

```js
$ eth-debug-lines < MyContract.sol
```

## API Usage

```js
const injectDebugLines = require('eth-debug-lines')

const src = `contract MyContract {
  function foo() {
    uint a;
    uint b;
    uint c;
  }
}`

console.log(injectDebugLines(src))

/* Output:

contract MyContract {

  // INJECTED
  event DebugLine(uint line);

  function foo() {
DebugLine(3);
    uint a;
DebugLine(4);
    uint b;
DebugLine(5);
    uint c;
  }
}
*/

```

## Issues

Before reporting, please makes sure your source is parseable via [solidity-parser](https://github.com/ConsenSys/solidity-parser).

<!--### Known Issues

-->

## License

ISC © [Raine Revere](https://github.com/raineorshine)
