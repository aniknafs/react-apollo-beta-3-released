"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var hoistNonReactStatics = require('hoist-non-react-statics');
var parser_1 = require("./parser");
var Query_1 = require("./Query");
var hoc_utils_1 = require("./hoc-utils");
var logUnhandledError = function (r, graphQLDisplayName) {
    if (r.error) {
        var error_1 = r.error;
        var logErrorTimeoutId_1 = setTimeout(function () {
            if (error_1) {
                var errorMessage = error_1;
                if (error_1.stack) {
                    errorMessage = error_1.stack.includes(error_1.message)
                        ? error_1.stack
                        : error_1.message + "\n" + error_1.stack;
                }
                console.error("Unhandled (in react-apollo:" + graphQLDisplayName + ")", errorMessage);
            }
        }, 10);
        Object.defineProperty(r, 'error', {
            configurable: true,
            enumerable: true,
            get: function () {
                clearTimeout(logErrorTimeoutId_1);
                return error_1;
            },
        });
    }
};
function query(document, operationOptions, logUnhandled) {
    if (operationOptions === void 0) { operationOptions = {}; }
    if (logUnhandled === void 0) { logUnhandled = false; }
    var operation = parser_1.parser(document);
    var _a = operationOptions.options, options = _a === void 0 ? hoc_utils_1.defaultMapPropsToOptions : _a, _b = operationOptions.skip, skip = _b === void 0 ? hoc_utils_1.defaultMapPropsToSkip : _b, _c = operationOptions.alias, alias = _c === void 0 ? 'Apollo' : _c;
    var mapPropsToOptions = options;
    if (typeof mapPropsToOptions !== 'function')
        mapPropsToOptions = function () { return options; };
    var mapPropsToSkip = skip;
    if (typeof mapPropsToSkip !== 'function')
        mapPropsToSkip = function () { return skip; };
    var lastResultProps;
    return function (WrappedComponent) {
        var graphQLDisplayName = alias + "(" + hoc_utils_1.getDisplayName(WrappedComponent) + ")";
        var GraphQL = (function (_super) {
            __extends(GraphQL, _super);
            function GraphQL() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            GraphQL.prototype.render = function () {
                var _this = this;
                var props = this.props;
                var shouldSkip = mapPropsToSkip(props);
                var opts = shouldSkip ? Object.create(null) : mapPropsToOptions(props);
                if (!shouldSkip && !opts.variables && operation.variables.length > 0) {
                    opts.variables = hoc_utils_1.calculateVariablesFromProps(operation, props, graphQLDisplayName, hoc_utils_1.getDisplayName(WrappedComponent));
                }
                return (React.createElement(Query_1.default, __assign({}, opts, { displayName: graphQLDisplayName, skip: shouldSkip, query: document, warnUnhandledError: true }), function (_a) {
                    var _ = _a.client, data = _a.data, r = __rest(_a, ["client", "data"]);
                    if (logUnhandled)
                        logUnhandledError(r, graphQLDisplayName);
                    if (operationOptions.withRef) {
                        _this.withRef = true;
                        props = Object.assign({}, props, {
                            ref: _this.setWrappedInstance,
                        });
                    }
                    if (shouldSkip)
                        return React.createElement(WrappedComponent, __assign({}, props));
                    var result = Object.assign(r, data || {});
                    var name = operationOptions.name || 'data';
                    var childProps = (_b = {}, _b[name] = result, _b);
                    if (operationOptions.props) {
                        var newResult = (_c = {},
                            _c[name] = result,
                            _c.ownProps = props,
                            _c);
                        lastResultProps = operationOptions.props(newResult, lastResultProps);
                        childProps = lastResultProps;
                    }
                    return React.createElement(WrappedComponent, __assign({}, props, childProps));
                    var _b, _c;
                }));
            };
            GraphQL.displayName = graphQLDisplayName;
            GraphQL.WrappedComponent = WrappedComponent;
            return GraphQL;
        }(hoc_utils_1.GraphQLBase));
        return hoistNonReactStatics(GraphQL, WrappedComponent, {});
    };
}
exports.query = query;
//# sourceMappingURL=query-hoc.js.map