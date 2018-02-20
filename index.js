const cloneDeep = require('lodash.clonedeep')
const rollup = require('rollup')
const log = require('debug')('cypress:rollup')
require('reify')

const bundles = {}

const defaultOptions = {
  output: {},
  watch: {},
}

const preprocessor = (rollupConfig) => {
  const options = require(rollupConfig).default
  log('user options:', options)

  // Callback function should return one of the following:
  // A promise that eventually resolves the path to the built file.
  // A promise that eventually rejects with an error that occurred during processing.
  //
  // The promise should resolve only after the file has completed writing to disk.
  // The promise resolving is a signal that the file is ready to be served to the browser.

  return (file) => {
    const filePath = file.filePath
    log('get', filePath)

    console.log('preprocessing ' + filePath)

    // since this function can get called multiple times with the same
    // filePath, we return the cached bundle promise if we already have one
    // since we don't want or need to re-initiate rollup for it
    if (bundles[filePath]) {
      log(`already have bundle for ${filePath}`)
      console.log(`already have bundle for ${filePath}`)
      return bundles[filePath]
    }

    // user can override the default options
    let inputOptions = Object.assign({}, defaultOptions, options)
    delete inputOptions.output
    delete inputOptions.watch
    inputOptions.input = filePath

    let outputOptions = Object.assign({}, defaultOptions.output, options.output)
    // we're provided a default output path that lives alongside Cypress's
    // app data files so we don't have to worry about where to put the bundled
    // file on disk
    const outputPath = file.outputPath
    outputOptions.file = outputPath

    const mergedWatchOpts = Object.assign({}, defaultOptions.watch, options.watch)
    const watchOptions = Object.assign({}, inputOptions)
    watchOptions.output = outputOptions
    watchOptions.watch = mergedWatchOpts

    log(`input: ${filePath}`)
    log(`output: ${outputPath}`)

    bundles[filePath] = rollup.rollup(inputOptions).then((bundle) =>
      bundle.write(outputOptions).then(() => outputPath)
    )

    let watcher
    if (file.shouldWatch) {
      watcher = rollup.watch(watchOptions)
      watcher.on('event', (event) => {
        console.log('triggered rebuild:' + event.code)
        if (event.code === 'END' || event.code === 'FATAL'
          || event.code === 'ERROR') {
          log('- compile finished for', filePath)
          console.log('- compile finished for ' + filePath)
          // when the bundling is finished, we call `util.fileUpdated`
          // to let Cypress know to re-run the spec
          if (event.code === 'FATAL'
            || event.code === 'ERROR') {
            bundles[filePath] = undefined
          } else {
            file.emit('rerun')
          }
        }
        // event.code can be one of:
        //   START        — the watcher is (re)starting
        //   BUNDLE_START — building an individual bundle
        //   BUNDLE_END   — finished building a bundle
        //   END          — finished building all bundles
        //   ERROR        — encountered an error while bundling
        //   FATAL        — encountered an unrecoverable error
      })
    }

    // when the spec or project is closed, we need to clean up the cached
    // bundle promise and stop the watcher via `bundler.close()`
    file.on('close', () => {
      log('close', filePath)
      console.log('close '+ filePath)
      delete bundles[filePath]

      if (watcher) {
        console.log('stop watcher '+ filePath)
        watcher.close()
      }
    })
    return bundles[filePath]
  }
}

// provide a clone of the default options
preprocessor.defaultOptions = cloneDeep(defaultOptions)

module.exports = preprocessor
