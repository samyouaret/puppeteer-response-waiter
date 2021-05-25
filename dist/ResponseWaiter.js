"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseWaiter {
    constructor(page, options) {
        this.options = options || {};
        this.page = page;
        this.requestsCount = 0;
        if (!options.resetOnNavigate) {
            options.resetOnNavigate = true;
        }
        if (!options.timeout) {
            options.timeout = 500;
        }
        this.requestHandler = (request) => {
            if (this.options.resourceType &&
                request.resourceType() != this.options.resourceType) {
                return;
            }
            ++this.requestsCount;
            request.continue();
        };
        this.responseHandler = () => {
            this.requestsCount > 0 && --this.requestsCount;
        };
        this.framenavigatedHandler = () => {
            this.options.debug && console.log("resetting waiting");
            this.requestsCount = 0;
        };
        this.requestfailedHandler = (request) => {
            this.options.debug && console.log(`requests failed ${request.url()} ${request.failure().errorText}`);
            this.requestsCount > 0 && --this.requestsCount;
        };
    }
    listen() {
        this.page.on('request', this.requestHandler);
        if (this.options.resetOnNavigate) {
            this.page.on('framenavigated', this.framenavigatedHandler);
        }
        this.page.on('response', this.responseHandler);
        this.page.on('requestfailed', this.requestfailedHandler);
    }
    stopListening() {
        this.page.off('request', this.requestHandler);
        this.page.off('requestfailed', this.requestfailedHandler);
        this.page.off('response', this.responseHandler);
    }
    async waitForResponsesToFinish() {
        this.options.debug && console.log('waiting...');
        do {
            this.options.debug && console.log(`waiting for ${this.requestsCount} pending reqs`);
            await this.page.waitForTimeout(this.options.timeout);
        } while (this.requestsCount > 0);
    }
    getRequestsCount() {
        return this.requestsCount;
    }
}
module.exports = ResponseWaiter;
//# sourceMappingURL=ResponseWaiter.js.map