import * as React from 'react';
import * as PropTypes from 'prop-types';
const invariant = require('invariant');
const shallowEqual = require('fbjs/lib/shallowEqual');
import { parser, DocumentType } from './parser';
const initialState = {
    notCalled: true,
};
class Mutation extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.runMutation = (options = {}) => {
            this.onStartMutation();
            const mutationId = this.generateNewMutationId();
            return this.mutate(options)
                .then(response => {
                this.onCompletedMutation(response, mutationId);
                return response;
            })
                .catch(e => {
                this.onMutationError(e, mutationId);
                if (!this.props.onError)
                    throw e;
            });
        };
        this.mutate = (options) => {
            const { mutation, variables, optimisticResponse, update } = this.props;
            let refetchQueries = options.refetchQueries || this.props.refetchQueries;
            if (refetchQueries && refetchQueries.length && Array.isArray(refetchQueries)) {
                refetchQueries = refetchQueries.map((x) => {
                    if (typeof x === 'string' && this.context.operations)
                        return this.context.operations.get(x);
                    return x;
                });
                delete options.refetchQueries;
            }
            return this.client.mutate(Object.assign({ mutation,
                variables,
                optimisticResponse,
                refetchQueries,
                update }, options));
        };
        this.onStartMutation = () => {
            if (!this.state.loading && !this.props.ignoreResults) {
                this.setState({
                    loading: true,
                    error: undefined,
                    data: undefined,
                    notCalled: false,
                });
            }
        };
        this.onCompletedMutation = (response, mutationId) => {
            const { onCompleted, ignoreResults } = this.props;
            const data = response.data;
            const callOncomplete = () => (onCompleted ? onCompleted(data) : null);
            if (this.isMostRecentMutation(mutationId) && !ignoreResults) {
                this.setState({ loading: false, data }, callOncomplete);
            }
            else {
                callOncomplete();
            }
        };
        this.onMutationError = (error, mutationId) => {
            const { onError } = this.props;
            const callOnError = () => (onError ? onError(error) : null);
            if (this.isMostRecentMutation(mutationId)) {
                this.setState({ loading: false, error }, callOnError);
            }
            else {
                callOnError();
            }
        };
        this.generateNewMutationId = () => {
            this.mostRecentMutationId = this.mostRecentMutationId + 1;
            return this.mostRecentMutationId;
        };
        this.isMostRecentMutation = (mutationId) => {
            return this.mostRecentMutationId === mutationId;
        };
        this.verifyDocumentIsMutation = (mutation) => {
            const operation = parser(mutation);
            invariant(operation.type === DocumentType.Mutation, `The <Mutation /> component requires a graphql mutation, but got a ${operation.type === DocumentType.Query ? 'query' : 'subscription'}.`);
        };
        this.verifyContext = (context) => {
            invariant(!!context.client, `Could not find "client" in the context of Mutation. Wrap the root component in an <ApolloProvider>`);
        };
        this.verifyContext(context);
        this.client = context.client;
        this.verifyDocumentIsMutation(props.mutation);
        this.mostRecentMutationId = 0;
        this.state = initialState;
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (shallowEqual(this.props, nextProps) && this.client === nextContext.client) {
            return;
        }
        if (this.props.mutation !== nextProps.mutation) {
            this.verifyDocumentIsMutation(nextProps.mutation);
        }
        if (this.client !== nextContext.client) {
            this.client = nextContext.client;
            this.setState(initialState);
        }
    }
    render() {
        const { children } = this.props;
        const { loading, data, error, notCalled } = this.state;
        const result = notCalled
            ? undefined
            : {
                loading,
                data,
                error,
            };
        return children(this.runMutation, result);
    }
}
Mutation.contextTypes = {
    client: PropTypes.object.isRequired,
    operations: PropTypes.object,
};
Mutation.propTypes = {
    mutation: PropTypes.object.isRequired,
    variables: PropTypes.object,
    optimisticResponse: PropTypes.object,
    refetchQueries: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.func,
    ]),
    update: PropTypes.func,
    children: PropTypes.func.isRequired,
    onCompleted: PropTypes.func,
    onError: PropTypes.func,
};
export default Mutation;
