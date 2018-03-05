import * as React from 'react';
const hoistNonReactStatics = require('hoist-non-react-statics');
import { parser } from './parser';
import { default as Mutation } from './Mutation';
import { defaultMapPropsToOptions, getDisplayName, calculateVariablesFromProps, GraphQLBase, } from './hoc-utils';
export function mutation(document, operationOptions = {}) {
    const operation = parser(document);
    const { options = defaultMapPropsToOptions, alias = 'Apollo' } = operationOptions;
    let mapPropsToOptions = options;
    if (typeof mapPropsToOptions !== 'function')
        mapPropsToOptions = () => options;
    return (WrappedComponent) => {
        const graphQLDisplayName = `${alias}(${getDisplayName(WrappedComponent)})`;
        class GraphQL extends GraphQLBase {
            render() {
                let props = this.props;
                const opts = mapPropsToOptions(props);
                if (operationOptions.withRef) {
                    this.withRef = true;
                    props = Object.assign({}, props, {
                        ref: this.setWrappedInstance,
                    });
                }
                if (!opts.variables && operation.variables.length > 0) {
                    opts.variables = calculateVariablesFromProps(operation, props, graphQLDisplayName, getDisplayName(WrappedComponent));
                }
                return (React.createElement(Mutation, Object.assign({}, opts, { mutation: document, ignoreResults: true }), (mutate, _result) => {
                    const name = operationOptions.name || 'mutate';
                    let childProps = { [name]: mutate };
                    if (operationOptions.props) {
                        const newResult = {
                            [name]: mutate,
                            ownProps: props,
                        };
                        childProps = operationOptions.props(newResult);
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
