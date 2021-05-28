# Puppeteer-response-waiter

## Introduction

this package is useful when you need to wait for all responses to be received to do something like manipulating the DOM, usually when you need to **track many requests at once** or some requests are **lately received**.

some use cases could be **scraping an infinite scroll** page and mostly you do not know which requests to track or to wait for.

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
const {ResponseWaiter} = require('puppeteer-response-waiter');

let browser = await puppeteer.launch({ headless: false });
let page = await browser.newPage();
let responseWaiter = new ResponseWaiter(page);
await page.goto('http://somesampleurl.com');
// start listening
responseWaiter.listen();
// do something here to trigger requests
await responseWaiter.wait();
// all requests are finished and responses are all returned back

// remove listeners
responseWaiter.stopListening();
await browser.close();

```

### An example using custom timeout

```js
const puppeteer = require('puppeteer');
const {ResponseWaiter} = require('puppeteer-response-waiter');

let browser = await puppeteer.launch({ headless: false });
let page = await browser.newPage();
let responseWaiter = new ResponseWaiter(page, {
        timeout: 500,
});
await page.goto('http://somesampleurl.com');
// start listening
responseWaiter.listen();
// do something here to trigger requests
await responseWaiter.wait();
// all requests are finished and responses are all returned back

// remove listeners
responseWaiter.stopListening();
await browser.close();

```

**NOTE**: The `timeout` option is really mandatory for the package to work, choosing the right `timeout` depends on the network and resource that your script is using, for most cases `100-500ms` are just fine, by default `Puppeteer-response-waiter` use `200ms`.

### Wait for all image responses to be back before doing something

using `waitFor` option you can filter the requests you need to wait for

```js
const puppeteer = require('puppeteer');
const {ResponseWaiter} = require('puppeteer-response-waiter');

let browser = await puppeteer.launch({ headless: false });
let page = await browser.newPage();
let responseWaiter = new ResponseWaiter(page, {
        waitFor: (req) => req.resourceType() == 'image'
});
await page.goto('http://somesampleurl.com');
// start listening
responseWaiter.listen();
// do something here to trigger requests
await responseWaiter.wait();
// all requests are finished and responses are all returned back

// remove listeners
responseWaiter.stopListening();
await browser.close();

```

## Other considerations

Sometimes when you may navigate before the requests have finished, by default `Puppeteer-response-waiter` will reset request count and resolve directly, you can customize this behavior(not recommended it will hang your code infinitely but it is something you may want to know).