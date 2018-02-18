# Cypress Rollup Preprocessor

Cypress preprocessor for bundling JavaScript via rollup

## Installation

Requires [Node](https://nodejs.org/en/) version 6.5.0 or above.

```sh
npm install --save-dev @cypress/rollup-preprocessor
```

## Usage

In your project's [plugins file](https://on.cypress.io/guides/guides/plugins.html):

```javascript
const rollup = require('@cypress/rollup-preprocessor')

module.exports = (on) => {
  on('file:preprocessor', rollup())
}
```

## Options

Pass in options as the second argument to `rollup`:

```javascript
const rollup = require('@cypress/rollup-preprocessor')
module.exports = (on) => {
  config: require('../../rollup.config.js')
  on('file:preprocessor', rollup(config))
}
```


## Contributing

Run all tests once:

```shell
npm test
```

Run tests in watch mode:

```shell
npm run test-watch
```

## License

This project is licensed under the terms of the [MIT license](/LICENSE.md).

