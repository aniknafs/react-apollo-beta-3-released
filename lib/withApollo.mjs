import * as React from 'react';
import ApolloConsumer from './ApolloConsumer';
const invariant = require('invariant');
const hoistNonReactStatics = require('hoist-non-react-statics');
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
export default function withApollo(WrappedComponent, operationOptions = {}) {
    const withDisplayName = `withApollo(${getDisplayName(WrappedComponent)})`;
    class WithApollo extends React.Component {
        constructor(props) {
            super(props);
            this.setWrappedInstance = this.setWrappedInstance.bind(this);
        }
        getWrappedInstance() {
            invariant(operationOptions.withRef, `To access the wrapped instance, you need to specify ` + `{ withRef: true } in the options`);
            return this.wrappedInstance;
        }
        setWrappedInstance(ref) {
            this.wrappedInstance = ref;
        }
        render() {
            return (React.createElement(ApolloConsumer, null, client => {
                const props = Object.assign({}, this.props, {
                    client,
                    ref: operationOptions.withRef ? this.setWrappedInstance : undefined,
                });
                return React.createElement(WrappedComponent, Object.assign({}, props));
            }));
        }
    }
    WithApollo.displayName = withDisplayName;
    WithApollo.WrappedComponent = WrappedComponent;
    return hoistNonReactStatics(WithApollo, WrappedComponent, {});
}
