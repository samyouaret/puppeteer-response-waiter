import { HTTPRequest, HTTPResponse, Page } from 'puppeteer';
// Some requests should not fail
// maybe we should track them to assure program correctness
interface WaiterOptions {
    timeout?: number;
    ressetOnNavigate?: boolean,
    resourceType?: string,
    debug?: boolean
}

type requestEventHanlder = (request: HTTPRequest) => void;
type responseEventHanlder = (response: HTTPResponse) => void;
type framenavigatedEventHanlder = (frame: any) => void;

class ResponseWaiter {
    options: WaiterOptions;
    requestsCount: number;
    page: Page;
    requestHandler: requestEventHanlder;
    responseHandler: responseEventHanlder;
    requestfailedHandler: requestEventHanlder;
    framenavigatedHandler: framenavigatedEventHanlder;

    constructor(page: Page, options?: WaiterOptions) {
        this.options = options || {};
        this.page = page;
        this.requestsCount = 0;

        if (!options.ressetOnNavigate) {
            options.ressetOnNavigate = true;
        }

        if (!options.timeout) {
            options.timeout = 500;
        }

        this.requestHandler = (request: HTTPRequest) => {
            if (this.options.resourceType &&
                request.resourceType() != this.options.resourceType) {
                return;
            }
            ++this.requestsCount;
        }

        this.responseHandler = () => {
            this.requestsCount > 0 && --this.requestsCount;
        };

        this.framenavigatedHandler = () => {
            this.options.debug && console.log("resetting waiting");
            this.requestsCount = 0;
        };

        this.requestfailedHandler = (request: HTTPRequest) => {
            this.options.debug && console.log(`requests failed ${request.url()} ${request.failure().errorText}`);
            this.requestsCount > 0 && --this.requestsCount;
        }
    }

    listen() {
        this.page.on('request', this.requestHandler)
        if (this.options.ressetOnNavigate) {
            this.page.on('framenavigated', this.framenavigatedHandler);
        }
        this.page.on('requestfailed', this.requestfailedHandler);
        this.page.on('response', this.responseHandler);
    }

    stopListening() {
        this.page.off('request', this.requestHandler)
        this.page.off('requestfailed', this.requestfailedHandler);
        this.page.off('response', this.responseHandler);
    }

    async waitForResponsesToFinish(): Promise<void> {
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