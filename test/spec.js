const fs = require('fs')
const path = require('path')
const chai = require('chai')
const spawn = require('spawn-please')
const generateInterface = require('../')
const chaiAsPromised = require("chai-as-promised")
const should = chai.should()
chai.use(chaiAsPromised)

describe('eth-debug-lines', () => {

  it('should inject DebugLine events into source', () => {
    const src = `contract MyContract {
  function foo() {
    uint a;
    uint b;
    uint c;
  }
}
`
    const expectedOutput = `contract MyContract {
  event DebugLine(uint line); function foo() {
    DebugLine(3); uint a;
    DebugLine(4); uint b;
    DebugLine(5); uint c;
  }
}
`
    generateInterface(src).should.equal(expectedOutput)
  })

  it('should inject a DebugLine log before throw statements', () => {
    const src = `contract MyContract {
  function foo() {
    uint a;
    throw;
    uint b;
  }
}
`
    const expectedOutput = `contract MyContract {
  event DebugLine(uint line); function foo() {
    DebugLine(3); uint a;
    DebugLine(4); throw;
    DebugLine(5); uint b;
  }
}
`
    generateInterface(src).should.equal(expectedOutput)
  })

  it('should inject DebugLine events into source with no newlines', () => {
    const src = `contract MyContract {
  function foo() { uint a; uint b;
    uint c;
  }
}`
    const expectedOutput = `contract MyContract {
  event DebugLine(uint line); function foo() { DebugLine(2); uint a; DebugLine(2); uint b;
    DebugLine(3); uint c;
  }
}`
    generateInterface(src).should.equal(expectedOutput)
  })

  it('should work on libraries', () => {
    const src = `library MyContract {
  function foo() {
    uint a;
    uint b;
    uint c;
  }
}
`
    const expectedOutput = `library MyContract {
  event DebugLine(uint line); function foo() {
    DebugLine(3); uint a;
    DebugLine(4); uint b;
    DebugLine(5); uint c;
  }
}
`
    generateInterface(src).should.equal(expectedOutput)
  })


  it('should read files from stdin', () => {
    const src = `contract MyContract {
  function foo() {
    uint a;
    uint b;
    uint c;
  }
}`
    const expectedOutput = `contract MyContract {
  event DebugLine(uint line); function foo() {
    DebugLine(3); uint a;
    DebugLine(4); uint b;
    DebugLine(5); uint c;
  }
}
`
    return spawn('node', ['bin.js'], src).should.eventually.equal(expectedOutput)
  })

})
