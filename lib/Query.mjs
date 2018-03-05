var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ApolloError, } from 'apollo-client';
import { parser, DocumentType } from './parser';
const shallowEqual = require('fbjs/lib/shallowEqual');
const invariant = require('invariant');
function compact(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        if (obj[key] !== undefined) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}
function observableQueryFields(observable) {
    const fields = {
        variables: observable.variables,
        refetch: observable.refetch.bind(observable),
        fetchMore: observable.fetchMore.bind(observable),
        updateQuery: observable.updateQuery.bind(observable),
        startPolling: observable.startPolling.bind(observable),
        stopPolling: observable.stopPolling.bind(observable),
        subscribeToMore: observable.subscribeToMore.bind(observable),
    };
    return fields;
}
export default class Query extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.previousData = {};
        this.startQuerySubscription = () => {
            if (this.querySubscription)
                return;
            this.querySubscription = this.queryObservable.subscribe({
                next: this.updateCurrentData,
                error: error => {
                    this.resubscribeToQuery();
                    if (!error.hasOwnProperty('graphQLErrors'))
                        throw error;
                    this.updateCurrentData();
                },
            });
        };
        this.removeQuerySubscription = () => {
            if (this.querySubscription) {
                this.querySubscription.unsubscribe();
                delete this.querySubscription;
            }
        };
        this.updateCurrentData = () => {
            if (this.hasMounted)
                this.forceUpdate();
        };
        this.getQueryResult = () => {
            let data = { data: Object.create(null) };
            Object.assign(data, observableQueryFields(this.queryObservable));
            const currentResult = this.queryObservable.currentResult();
            const { loading, networkStatus, errors } = currentResult;
            let { error } = currentResult;
            if (errors && errors.length > 0) {
                error = new ApolloError({ graphQLErrors: errors });
            }
            Object.assign(data, { loading, networkStatus, error });
            if (loading) {
                Object.assign(data.data, this.previousData, currentResult.data);
            }
            else if (error) {
                Object.assign(data, {
                    data: (this.queryObservable.getLastResult() || {}).data,
                });
            }
            else {
                Object.assign(data.data, currentResult.data);
                this.previousData = currentResult.data;
            }
            if (!this.querySubscription) {
                data.refetch = args => {
                    return new Promise((r, f) => {
                        this.refetcherQueue = { resolve: r, reject: f, args };
                    });
                };
            }
            data.client = this.client;
            return data;
        };
        this.client = props.client || context.client;
        invariant(!!this.client, `Could not find "client" in the context of Query or as passed props. Wrap the root component in an <ApolloProvider>`);
        this.initializeQueryObservable(props);
    }
    fetchData() {
        if (this.props.skip)
            return false;
        const _a = this.props, { children, ssr, displayName, skip, client } = _a, opts = __rest(_a, ["children", "ssr", "displayName", "skip", "client"]);
        let { fetchPolicy } = opts;
        if (ssr === false)
            return false;
        if (fetchPolicy === 'network-only' || fetchPolicy === 'cache-and-network') {
            fetchPolicy = 'cache-first';
        }
        const observable = this.client.watchQuery(Object.assign({}, opts, { fetchPolicy }));
        const result = this.queryObservable.currentResult();
        return result.loading ? observable.result() : false;
    }
    componentDidMount() {
        this.hasMounted = true;
        if (this.props.skip)
            return;
        this.startQuerySubscription();
        if (this.refetcherQueue) {
            const { args, resolve, reject } = this.refetcherQueue;
            this.queryObservable
                .refetch(args)
                .then(resolve)
                .catch(reject);
        }
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.skip && !this.props.skip) {
            this.removeQuerySubscription();
            return;
        }
        const { client } = nextProps;
        if (shallowEqual(this.props, nextProps) &&
            (this.client === client || this.client === nextContext.client)) {
            return;
        }
        if (this.client !== client && this.client !== nextContext.client) {
            if (client) {
                this.client = client;
            }
            else {
                this.client = nextContext.client;
            }
            this.removeQuerySubscription();
            this.queryObservable = null;
            this.previousData = {};
            this.updateQuery(nextProps);
        }
        if (this.props.query !== nextProps.query) {
            this.removeQuerySubscription();
        }
        this.updateQuery(nextProps);
        if (nextProps.skip)
            return;
        this.startQuerySubscription();
    }
    componentWillUnmount() {
        this.removeQuerySubscription();
        this.hasMounted = false;
    }
    render() {
        const { children } = this.props;
        const queryResult = this.getQueryResult();
        return children(queryResult);
    }
    extractOptsFromProps(props) {
        const { variables, pollInterval, fetchPolicy, errorPolicy, notifyOnNetworkStatusChange, query, displayName = 'Query', } = props;
        this.operation = parser(query);
        invariant(this.operation.type === DocumentType.Query, `The <Query /> component requires a graphql query, but got a ${this.operation.type === DocumentType.Mutation ? 'mutation' : 'subscription'}.`);
        return compact({
            variables,
            pollInterval,
            query,
            fetchPolicy,
            errorPolicy,
            notifyOnNetworkStatusChange,
            metadata: { reactComponent: { displayName } },
        });
    }
    initializeQueryObservable(props) {
        const opts = this.extractOptsFromProps(props);
        if (this.context.operations) {
            this.context.operations.set(this.operation.name, {
                query: opts.query,
                variables: opts.variables,
            });
        }
        this.queryObservable = this.client.watchQuery(opts);
    }
    updateQuery(props) {
        if (!this.queryObservable)
            this.initializeQueryObservable(props);
        this.queryObservable
            .setOptions(this.extractOptsFromProps(props))
            .catch(() => null);
    }
    resubscribeToQuery() {
        this.removeQuerySubscription();
        const lastError = this.queryObservable.getLastError();
        const lastResult = this.queryObservable.getLastResult();
        this.queryObservable.resetLastResults();
        this.startQuerySubscription();
        Object.assign(this.queryObservable, { lastError, lastResult });
    }
}
Query.contextTypes = {
    client: PropTypes.object.isRequired,
    operations: PropTypes.object,
};
Query.propTypes = {
    children: PropTypes.func.isRequired,
    fetchPolicy: PropTypes.string,
    notifyOnNetworkStatusChange: PropTypes.bool,
    pollInterval: PropTypes.number,
    query: PropTypes.object.isRequired,
    variables: PropTypes.object,
    ssr: PropTypes.bool,
};
