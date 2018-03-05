import { ApolloLink, Observable, } from 'apollo-link';
import { print } from 'graphql/language/printer';
export class MockLink extends ApolloLink {
    constructor(mockedResponses) {
        super();
        this.mockedResponsesByKey = {};
        mockedResponses.forEach(mockedResponse => {
            this.addMockedResponse(mockedResponse);
        });
    }
    addMockedResponse(mockedResponse) {
        const key = requestToKey(mockedResponse.request);
        let mockedResponses = this.mockedResponsesByKey[key];
        if (!mockedResponses) {
            mockedResponses = [];
            this.mockedResponsesByKey[key] = mockedResponses;
        }
        mockedResponses.push(mockedResponse);
    }
    request(operation) {
        const key = requestToKey(operation);
        const responses = this.mockedResponsesByKey[key];
        if (!responses || responses.length === 0) {
            throw new Error(`No more mocked responses for the query: ${print(operation.query)}, variables: ${JSON.stringify(operation.variables)}`);
        }
        const original = [...this.mockedResponsesByKey[key]];
        const { result, error, delay, newData } = this.mockedResponsesByKey[key].shift() || {};
        if (newData) {
            original[0].result = newData();
            this.mockedResponsesByKey[key].push(original[0]);
        }
        if (!result && !error) {
            throw new Error(`Mocked response should contain either result or error: ${key}`);
        }
        return new Observable(observer => {
            let timer = setTimeout(() => {
                if (error) {
                    observer.error(error);
                }
                else {
                    if (result)
                        observer.next(result);
                    observer.complete();
                }
            }, delay ? delay : 0);
            return () => {
                clearTimeout(timer);
            };
        });
    }
}
export class MockSubscriptionLink extends ApolloLink {
    constructor() {
        super();
        this.unsubscribers = [];
        this.setups = [];
    }
    request(_req) {
        return new Observable(observer => {
            this.setups.forEach(x => x());
            this.observer = observer;
            return () => {
                this.unsubscribers.forEach(x => x());
            };
        });
    }
    simulateResult(result) {
        setTimeout(() => {
            const { observer } = this;
            if (!observer)
                throw new Error('subscription torn down');
            if (result.result && observer.next)
                observer.next(result.result);
            if (result.error && observer.error)
                observer.error(result.error);
        }, result.delay || 0);
    }
    onSetup(listener) {
        this.setups = this.setups.concat([listener]);
    }
    onUnsubscribe(listener) {
        this.unsubscribers = this.unsubscribers.concat([listener]);
    }
}
function requestToKey(request) {
    const queryString = request.query && print(request.query);
    const requestKey = {
        variables: request.variables || {},
        query: queryString,
    };
    return JSON.stringify(requestKey);
}
export function mockSingleLink(...mockedResponses) {
    return new MockLink(mockedResponses);
}
export function mockObservableLink() {
    return new MockSubscriptionLink();
}
