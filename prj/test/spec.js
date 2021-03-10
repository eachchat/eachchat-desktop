const Application = require('spectron').Application
const assert = require('assert')
var expect = require('chai').expect;
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('test describe1', function () {
  it('first case', function () {
    let value = 2;
    expect(value).to.eql(2)
  })

  it('second case', function () {
      assert.equal(2, 1)    
  })
})
