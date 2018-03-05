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
const hoistNonReactStatics = require('hoist-non-react-statics');
import { parser } from './parser';
import { default as Subscription } from './Subscriptions';
import { getDisplayName, GraphQLBase, calculateVariablesFromProps, defaultMapPropsToOptions, defaultMapPropsToSkip, } from './hoc-utils';
export function subscribe(document, operationOptions = {}) {
    const operation = parser(document);
    const { options = defaultMapPropsToOptions, skip = defaultMapPropsToSkip, alias = 'Apollo', shouldResubscribe, } = operationOptions;
    let mapPropsToOptions = options;
    if (typeof mapPropsToOptions !== 'function')
        mapPropsToOptions = () => options;
    let mapPropsToSkip = skip;
    if (typeof mapPropsToSkip !== 'function')
        mapPropsToSkip = () => skip;
    let lastResultProps;
    return (WrappedComponent) => {
        const graphQLDisplayName = `${alias}(${getDisplayName(WrappedComponent)})`;
        class GraphQL extends GraphQLBase {
            constructor(props) {
                super(props);
                this.state = { resubscribe: false };
            }
            componentWillReceiveProps(nextProps) {
                if (!shouldResubscribe)
                    return;
                this.setState({
                    resubscribe: shouldResubscribe(this.props, nextProps),
                });
            }
            render() {
                let props = this.props;
                const shouldSkip = mapPropsToSkip(props);
                const opts = shouldSkip ? Object.create(null) : mapPropsToOptions(props);
                if (!shouldSkip && !opts.variables && operation.variables.length > 0) {
                    opts.variables = calculateVariablesFromProps(operation, props, graphQLDisplayName, getDisplayName(WrappedComponent));
                }
                return (React.createElement(Subscription, Object.assign({}, opts, { displayName: graphQLDisplayName, skip: shouldSkip, query: document, shouldResubscribe: this.state.resubscribe }), (_a) => {
                    var { data } = _a, r = __rest(_a, ["data"]);
                    if (operationOptions.withRef) {
                        this.withRef = true;
                        props = Object.assign({}, props, {
                            ref: this.setWrappedInstance,
                        });
                    }
                    if (shouldSkip)
                        return React.createElement(WrappedComponent, Object.assign({}, props));
                    const result = Object.assign(r, data || {});
                    const name = operationOptions.name || 'data';
                    let childProps = { [name]: result };
                    if (operationOptions.props) {
                        const newResult = {
                            [name]: result,
                            ownProps: props,
                        };
                        lastResultProps = operationOptions.props(newResult, lastResultProps);
                        childProps = lastResultProps;
                    }
                    return React.createElement(WrappedComponent, Object.assign({}, props, childProps));
                }));
            }
        }
        GraphQL.displayName = graphQLDisplayName;
        GraphQL.WrappedComponent = WrappedComponent;
        return hoistNonReactStatics(GraphQL, WrappedComponent, {});
    };
}
