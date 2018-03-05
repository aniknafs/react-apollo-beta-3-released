import * as PropTypes from 'prop-types';
import { Component } from 'react';
const invariant = require('invariant');
export default class ApolloProvider extends Component {
    constructor(props, context) {
        super(props, context);
        this.operations = new Map();
        invariant(props.client, 'ApolloClient was not passed a client instance. Make ' +
            'sure you pass in your client via the "client" prop.');
        if (!props.client.__operations_cache__) {
            props.client.__operations_cache__ = this.operations;
        }
    }
    getChildContext() {
        return {
            client: this.props.client,
            operations: this.props.client.__operations_cache__,
        };
    }
    render() {
        return this.props.children;
    }
}
ApolloProvider.propTypes = {
    client: PropTypes.object.isRequired,
    children: PropTypes.element.isRequired,
};
ApolloProvider.childContextTypes = {
    client: PropTypes.object.isRequired,
    operations: PropTypes.object,
};
