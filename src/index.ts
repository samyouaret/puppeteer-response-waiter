import { HTTPRequest, HTTPResponse, Page } from 'puppeteer';

interface WaiterOptions {
    timeout?: number;
    resetOnNavigate?: boolean,
    waitFor?: requestFilter,
    debug?: boolean
}

interface Waiter {
    listen(): void;
    wait(): Promise<void>;
    stopListening(): void;
    getRequestsCount(): number;
}

type requestEventHanlder = (request: HTTPRequest) => void;
type responseEventHanlder = (response: HTTPResponse) => void;
type framenavigatedEventHanlder = (frame: any) => void;
type requestFilter = (request: HTTPRequest) => boolean;

export class ResponseWaiter implements Waiter {
    options: WaiterOptions;
    requestsCount: number;
    page: Page;
    requestHandler: requestEventHanlder;
    responseHandler: responseEventHanlder;
    requestfailedHandler: requestEventHanlder;
    framenavigatedHandler: framenavigatedEventHanlder;

    constructor(page: Page, options?: WaiterOptions) {
        this.options = Object.assign({}, options);
        this.page = page;
        this.requestsCount = 0;
        if (!this.options.resetOnNavigate) {
            this.options.resetOnNavigate = true;
        }

        if (!this.options.timeout) {
            this.options.timeout = 200;
        }

        this.requestHandler = (request: HTTPRequest) => {
            if (!this.shouldWait(request)) {
                return;
            }
            this.options.debug && console.log(`wait for request ${request.url()}`);
            ++this.requestsCount;
        }

        this.responseHandler = (response: HTTPResponse) => {
            if (!this.shouldWait(response.request())) {
                return;
            }
            this.requestsCount > 0 && --this.requestsCount;
        };

        this.framenavigatedHandler = () => {
            this.options.debug && console.log("resetting waiting");
            this.requestsCount = 0;
        };

        this.requestfailedHandler = (request: HTTPRequest) => {
            if (!this.shouldWait(request)) {
                return;
            }
            this.options.debug && console.log(`requests failed ${request.url()} ${request.failure().errorText}`);
            this.requestsCount > 0 && --this.requestsCount;
        }
    }

    shouldWait(request: HTTPRequest): boolean {
        return this.options.waitFor && this.options.waitFor(request);
    }

    listen(): void {
        this.page.on('request', this.requestHandler)
        if (this.options.resetOnNavigate) {
            this.page.on('framenavigated', this.framenavigatedHandler);
        }
        this.page.on('requestfailed', this.requestfailedHandler);
        this.page.on('response', this.responseHandler);
    }

    stopListening(): void {
        this.page.off('request', this.requestHandler)
        this.page.off('requestfailed', this.requestfailedHandler);
        this.page.off('response', this.responseHandler);
        this.page.off('framenavigated', this.framenavigatedHandler);
    }

    async wait(): Promise<void> {
        this.options.debug && console.log('waiting...');
        do {
            this.options.debug && console.log(`waiting for ${this.requestsCount} pending reqs`);
            await this.page.waitForTimeout(this.options.timeout);
        } while (this.requestsCount > 0);
    }

    getRequestsCount(): number {
        return this.requestsCount;
    }
}

export default ResponseWaiter;