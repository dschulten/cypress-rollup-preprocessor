'use strict'

const chai = require('chai')
const expect = chai.expect


const preprocessor = require('../index')
const config = {
  //input: 'es2015module.js',
  output: {
    format: 'iife',
    //file: 'bundle.js',
    name: 'MyBundle',
  },
}

const eventHandlers = {}

const file = {
  filePath: './test/es2015module.js',
  outputPath: './test/bundle.js',
  shouldWatch: true,

  on(eventName, handler) {
    eventHandlers[eventName] = handler
  },
}

describe('rollup preprocessor', function () {

  it('executes rollup', function () {
    const fn = preprocessor(config)
    return fn(file).then((filename) =>
      expect(filename).to.equal(file.outputPath)
    )
  })

  it('handles close event', function () {
    const fn = preprocessor(config)
    return fn(file).then((filename) => {
      expect(filename).to.equal(file.outputPath)
      eventHandlers.close()
    })
  })
})
