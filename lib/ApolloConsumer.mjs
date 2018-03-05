import * as PropTypes from 'prop-types';
const invariant = require('invariant');
const ApolloConsumer = (props, context) => {
    invariant(!!context.client, `Could not find "client" in the context of ApolloConsumer. Wrap the root component in an <ApolloProvider>`);
    return props.children(context.client);
};
ApolloConsumer.contextTypes = {
    client: PropTypes.object.isRequired,
};
ApolloConsumer.propTypes = {
    children: PropTypes.func.isRequired,
};
export default ApolloConsumer;
