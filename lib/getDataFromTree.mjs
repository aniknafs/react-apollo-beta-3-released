import * as React from 'react';
function getProps(element) {
    return element.props || element.attributes;
}
function isReactElement(element) {
    return !!element.type;
}
function isComponentClass(Comp) {
    return Comp.prototype && (Comp.prototype.render || Comp.prototype.isReactComponent);
}
function providesChildContext(instance) {
    return !!instance.getChildContext;
}
export function walkTree(element, context, visitor) {
    if (Array.isArray(element)) {
        element.forEach(item => walkTree(item, context, visitor));
        return;
    }
    if (!element) {
        return;
    }
    if (isReactElement(element)) {
        if (typeof element.type === 'function') {
            const Comp = element.type;
            const props = Object.assign({}, Comp.defaultProps, getProps(element));
            let childContext = context;
            let child;
            if (isComponentClass(Comp)) {
                const instance = new Comp(props, context);
                instance.props = instance.props || props;
                instance.context = instance.context || context;
                instance.state = instance.state || null;
                instance.setState = newState => {
                    if (typeof newState === 'function') {
                        newState = newState(instance.state, instance.props, instance.context);
                    }
                    instance.state = Object.assign({}, instance.state, newState);
                };
                if (instance.componentWillMount) {
                    instance.componentWillMount();
                }
                if (providesChildContext(instance)) {
                    childContext = Object.assign({}, context, instance.getChildContext());
                }
                if (visitor(element, instance, context, childContext) === false) {
                    return;
                }
                child = instance.render();
            }
            else {
                if (visitor(element, null, context) === false) {
                    return;
                }
                child = Comp(props, context);
            }
            if (child) {
                if (Array.isArray(child)) {
                    child.forEach(item => walkTree(item, childContext, visitor));
                }
                else {
                    walkTree(child, childContext, visitor);
                }
            }
        }
        else {
            if (visitor(element, null, context) === false) {
                return;
            }
            if (element.props && element.props.children) {
                React.Children.forEach(element.props.children, (child) => {
                    if (child) {
                        walkTree(child, context, visitor);
                    }
                });
            }
        }
    }
    else if (typeof element === 'string' || typeof element === 'number') {
        visitor(element, null, context);
    }
}
function hasFetchDataFunction(instance) {
    return typeof instance.fetchData === 'function';
}
function isPromise(promise) {
    return typeof promise.then === 'function';
}
function getPromisesFromTree({ rootElement, rootContext = {} }) {
    const promises = [];
    walkTree(rootElement, rootContext, (_, instance, context, childContext) => {
        if (instance && hasFetchDataFunction(instance)) {
            const promise = instance.fetchData();
            if (isPromise(promise)) {
                promises.push({ promise, context: childContext || context, instance });
                return false;
            }
        }
    });
    return promises;
}
export default function getDataFromTree(rootElement, rootContext = {}) {
    const promises = getPromisesFromTree({ rootElement, rootContext });
    if (!promises.length) {
        return Promise.resolve();
    }
    const errors = [];
    const mappedPromises = promises.map(({ promise, context, instance }) => {
        return promise
            .then(_ => getDataFromTree(instance.render(), context))
            .catch(e => errors.push(e));
    });
    return Promise.all(mappedPromises).then(_ => {
        if (errors.length > 0) {
            const error = errors.length === 1
                ? errors[0]
                : new Error(`${errors.length} errors were thrown when executing your fetchData functions.`);
            error.queryErrors = errors;
            throw error;
        }
    });
}
