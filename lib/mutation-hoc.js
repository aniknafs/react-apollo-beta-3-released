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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var hoistNonReactStatics = require('hoist-non-react-statics');
var parser_1 = require("./parser");
var Mutation_1 = require("./Mutation");
var hoc_utils_1 = require("./hoc-utils");
function mutation(document, operationOptions) {
    if (operationOptions === void 0) { operationOptions = {}; }
    var operation = parser_1.parser(document);
    var _a = operationOptions.options, options = _a === void 0 ? hoc_utils_1.defaultMapPropsToOptions : _a, _b = operationOptions.alias, alias = _b === void 0 ? 'Apollo' : _b;
    var mapPropsToOptions = options;
    if (typeof mapPropsToOptions !== 'function')
        mapPropsToOptions = function () { return options; };
    return function (WrappedComponent) {
        var graphQLDisplayName = alias + "(" + hoc_utils_1.getDisplayName(WrappedComponent) + ")";
        var GraphQL = (function (_super) {
            __extends(GraphQL, _super);
            function GraphQL() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            GraphQL.prototype.render = function () {
                var props = this.props;
                var opts = mapPropsToOptions(props);
                if (operationOptions.withRef) {
                    this.withRef = true;
                    props = Object.assign({}, props, {
                        ref: this.setWrappedInstance,
                    });
                }
                if (!opts.variables && operation.variables.length > 0) {
                    opts.variables = hoc_utils_1.calculateVariablesFromProps(operation, props, graphQLDisplayName, hoc_utils_1.getDisplayName(WrappedComponent));
                }
                return (React.createElement(Mutation_1.default, __assign({}, opts, { mutation: document, ignoreResults: true }), function (mutate, _result) {
                    var name = operationOptions.name || 'mutate';
                    var childProps = (_a = {}, _a[name] = mutate, _a);
                    if (operationOptions.props) {
                        var newResult = (_b = {},
                            _b[name] = mutate,
                            _b.ownProps = props,
                            _b);
                        childProps = operationOptions.props(newResult);
                    }
                    return React.createElement(WrappedComponent, __assign({}, props, childProps));
                    var _a, _b;
                }));
            };
            GraphQL.displayName = graphQLDisplayName;
            GraphQL.WrappedComponent = WrappedComponent;
            return GraphQL;
        }(hoc_utils_1.GraphQLBase));
        return hoistNonReactStatics(GraphQL, WrappedComponent, {});
    };
}
exports.mutation = mutation;
//# sourceMappingURL=mutation-hoc.js.map