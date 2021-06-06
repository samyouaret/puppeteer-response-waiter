import * as http from "http";
import * as puppeteer from 'puppeteer'
import ResponseWaiter from '../src'

const PORT: number = 5000;
const URL: string = `http://localhost:${PORT}`;
const userResponse = { username: 'username', email: 'dumbmail@email.dumb' };

let server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.url == '/test-calls') {
        setTimeout(() => {
            res.end(JSON.stringify(userResponse));
        }, 200);
    } else if (req.url == '/test-navigation') {
        console.log("called in navigation");

        res.end("success call");
    } else if (req.url == '/') {
        res.end(`
        <html>
    <script>
    window.addEventListener('DOMContentLoaded', (event) => {
    for (let i = 0; i < 10; i++) {
        fetch('${URL}/test-calls');
    }
    });
  </script>
  </html>`);
    }
});

beforeEach((done) => {
    server.listen(PORT, () => {
        console.log("start listening");
        done();
    });
})


afterEach((done) => {
    server.close(() => {
        console.log("closing the server");
        done();
    });
})

it('should wait for all requests', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let responseWaiter = new ResponseWaiter(page);
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await responseWaiter.wait();
    expect(responseWaiter.getRequestsCount()).toBe(0);
    responseWaiter.stopListening();
    await browser.close();
});

it('should wait for all requests usign custom timeout 100ms', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let responseWaiter = new ResponseWaiter(page, {
        timeout: 100,
    });
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await responseWaiter.wait();
    expect(responseWaiter.getRequestsCount()).toBe(0);
    responseWaiter.stopListening();
    await browser.close();
});

it('should wait for all xhr requests', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let responseWaiter = new ResponseWaiter(page, {
        waitFor: (req) => req.resourceType() == 'fetch'
    });
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await responseWaiter.wait();
    expect(responseWaiter.getRequestsCount()).toBe(0);
    responseWaiter.stopListening();
    await browser.close();
});

it('should call onResponse when it is in options', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let mockCallback = jest.fn(() => { });
    let responseWaiter = new ResponseWaiter(page, {
        waitFor: (req) => req.resourceType() == 'fetch',
        onResponse: mockCallback
    });
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await responseWaiter.wait();
    expect(responseWaiter.getRequestsCount()).toBe(0);
    expect(mockCallback.mock.calls.length).toBe(10);
    responseWaiter.stopListening();
    await browser.close();
});

it('should call onResponse with correct responses', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let responseWaiter = new ResponseWaiter(page, {
        waitFor: (req) => req.resourceType() == 'fetch',
        onResponse: async (response) => {
            expect(await response.json()).toEqual(userResponse);
        }
    });
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await responseWaiter.wait();
    expect(responseWaiter.getRequestsCount()).toBe(0);
    responseWaiter.stopListening();
    await browser.close();
});

it('should wait for only defined resource type of requests', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let responseWaiter = new ResponseWaiter(page, {
        waitFor: (req) => req.resourceType() == 'image'
    });
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    expect(responseWaiter.getRequestsCount()).toBe(0);
    responseWaiter.stopListening();
    await browser.close();
});

it('should reset when a navigation happens', async () => {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let responseWaiter = new ResponseWaiter(page);
    responseWaiter.listen();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.goto(`${URL}/test-navigation`);
    expect(responseWaiter.getRequestsCount()).toBe(0);
    responseWaiter.stopListening();
    await browser.close();
});