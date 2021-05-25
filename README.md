# Puppeteer-response-waiter

## Introduction

this package is useful when you need to wait for all response to be recevied to do something like manipulating the DOM, usually when you need to track many requests at once.
some use cases would be like scraping a infinite scroll page which you may not know which requests to track or to wait for.

it a simple but powerful package event wait for thousands of requests at once and it guarentee to wait for all responses back.

some requests may or may not happen, when a requests does not happen `Puppeteer-response-waiter` just skip without throwing any error

NOTE: if you may want to assert that a requests is triggered and wait for it you may use the built-in api of puppetter to do that.

## Installation

    npm add puppeteer-response-waiter

    yarn add puppeteer-response-waiter

## Usage

### a sample example to wait for all responses to be back before doing something

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
