import * as React from 'react';
const invariant = require('invariant');
import { DocumentType } from './parser';
export const defaultMapPropsToOptions = () => ({});
export const defaultMapResultToProps = props => props;
export const defaultMapPropsToSkip = () => false;
export function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
export function calculateVariablesFromProps(operation, props, graphQLDisplayName, wrapperName) {
    let variables = {};
    for (let { variable, type } of operation.variables) {
        if (!variable.name || !variable.name.value)
            continue;
        const variableName = variable.name.value;
        const variableProp = props[variableName];
        if (typeof variableProp !== 'undefined') {
            variables[variableName] = variableProp;
            continue;
        }
        if (type.kind !== 'NonNullType') {
            variables[variableName] = null;
            continue;
        }
        if (operation.type === DocumentType.Mutation)
            return;
        invariant(typeof variableProp !== 'undefined', `The operation '${operation.name}' wrapping '${wrapperName}' ` +
            `is expecting a variable: '${variable.name.value}' but it was not found in the props ` +
            `passed to '${graphQLDisplayName}'`);
    }
    return variables;
}
export class GraphQLBase extends React.Component {
    constructor(props) {
        super(props);
        this.setWrappedInstance = this.setWrappedInstance.bind(this);
    }
    getWrappedInstance() {
        invariant(this.withRef, `To access the wrapped instance, you need to specify ` + `{ withRef: true } in the options`);
        return this.wrappedInstance;
    }
    setWrappedInstance(ref) {
        this.wrappedInstance = ref;
    }
}
