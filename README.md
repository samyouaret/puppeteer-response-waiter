# Puppeteer-response-waiter

## Introduction

this package is useful when you need to wait for all responses to be received to do something like manipulating the DOM, usually when you need to track many requests at once.

some use cases could be scraping an infinite scroll page and mostly you do not know which requests to track or to wait for.

it a simple but powerful package, it may be used even to wait for thousands of requests at once and it guarantees to wait for all responses.

some requests may or may not happen, when a request does not happen `Puppeteer-response-waiter` just skip without throwing any error.

**NOTE**: if you may want to assert that a request is triggered and wait for it you may use the puppeteer built-in `page` function `waitForResponse`.

## Installation

using npm

    npm i puppeteer-response-waiter

using yarn

    yarn add puppeteer-response-waiter

## Usage

### A sample example to wait for all responses to be back before doing something

```js
const puppeteer = require('puppeteer');
const ResponseWaiter = require('puppeteer-response-waiter');
import ResponseWaiter from '../src/ResponseWaiter'

let browser = await puppeteer.launch({ headless: false });
let page = await browser.newPage();
let responseWaiter = new ResponseWaiter(page, {
        timeout: 100,
        debug: true
});
// start listening
responseWaiter.listen();
await page.goto('http://somesampleurl.com');
// do something here to trigger requesets
await responseWaiter.waitForResponsesToFinish();
// all requests are finished and responses are all returned back

// remove listeners
responseWaiter.stopListening();
await browser.close();

```

### Wait for all image responses to be back before doing something

```js
const puppeteer = require('puppeteer');
const ResponseWaiter = require('puppeteer-response-waiter');
import ResponseWaiter from '../src/ResponseWaiter'

let browser = await puppeteer.launch({ headless: false });
let page = await browser.newPage();
let responseWaiter = new ResponseWaiter(page, {
        timeout: 100,
        waitFor: (req) => req.resourceType() == 'image'
});
// start listening
responseWaiter.listen();
await page.goto('http://somesampleurl.com');
// do something here to trigger requesets
await responseWaiter.waitForResponsesToFinish();
// all requests are finished and responses are all returned back

// remove listeners
responseWaiter.stopListening();
await browser.close();

```
