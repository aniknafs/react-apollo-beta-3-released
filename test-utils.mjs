import * as React from 'react';
import ApolloClient from 'apollo-client';
import { InMemoryCache as Cache } from 'apollo-cache-inmemory';
import { ApolloProvider } from './';
import { mockSingleLink } from './test-links';
export * from './test-links';
export class MockedProvider extends React.Component {
    constructor(props, context) {
        super(props, context);
        if (this.props.client)
            return;
        const addTypename = !this.props.removeTypename;
        const link = mockSingleLink.apply(null, this.props.mocks);
        this.client = new ApolloClient({
            link,
            cache: new Cache({ addTypename }),
            defaultOptions: this.props.defaultOptions,
        });
    }
    render() {
        return (React.createElement(ApolloProvider, { client: this.client || this.props.client }, this.props.children));
    }
}
