import * as React from 'react';
import * as PropTypes from 'prop-types';
const shallowEqual = require('fbjs/lib/shallowEqual');
const invariant = require('invariant');
class Subscription extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.initialize = (props) => {
            if (this.queryObservable)
                return;
            this.queryObservable = this.client.subscribe({
                query: props.query,
                variables: props.variables,
            });
        };
        this.startSubscription = () => {
            if (this.querySubscription)
                return;
            this.querySubscription = this.queryObservable.subscribe({
                next: this.updateCurrentData,
                error: this.updateError,
            });
        };
        this.getInitialState = () => ({
            loading: true,
            error: undefined,
            data: undefined,
        });
        this.updateCurrentData = (result) => {
            this.setState({
                data: result.data,
                loading: false,
                error: undefined,
            });
        };
        this.updateError = (error) => {
            this.setState({
                error,
                loading: false,
            });
        };
        this.endSubscription = () => {
            if (this.querySubscription) {
                this.querySubscription.unsubscribe();
                delete this.querySubscription;
            }
        };
        invariant(!!context.client, `Could not find "client" in the context of Subscription. Wrap the root component in an <ApolloProvider>`);
        this.client = context.client;
        this.initialize(props);
        this.state = this.getInitialState();
    }
    componentDidMount() {
        this.startSubscription();
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (shallowEqual(this.props, nextProps) && this.client === nextContext.client) {
            return;
        }
        const shouldNotResubscribe = this.props.shouldResubscribe === false;
        if (this.client !== nextContext.client) {
            this.client = nextContext.client;
        }
        if (!shouldNotResubscribe) {
            this.endSubscription();
            delete this.queryObservable;
            this.initialize(nextProps);
            this.startSubscription();
            this.setState(this.getInitialState());
            return;
        }
        this.initialize(nextProps);
        this.startSubscription();
    }
    componentWillUnmount() {
        this.endSubscription();
    }
    render() {
        const result = Object.assign({}, this.state, {
            variables: this.props.variables,
        });
        return this.props.children(result);
    }
}
Subscription.contextTypes = {
    client: PropTypes.object.isRequired,
};
Subscription.propTypes = {
    query: PropTypes.object.isRequired,
    variables: PropTypes.object,
    children: PropTypes.func.isRequired,
};
export default Subscription;
