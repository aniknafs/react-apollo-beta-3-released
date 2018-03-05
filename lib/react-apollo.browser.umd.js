(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['react-apollo'] = {})));
}(this, (function (exports) { 'use strict';

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var getDataFromTree_1 = require("./getDataFromTree");
exports.getDataFromTree = getDataFromTree_1.default;
__export(require("./getDataFromTree"));
var ApolloConsumer_1 = require("./ApolloConsumer");
exports.ApolloConsumer = ApolloConsumer_1.default;
__export(require("./ApolloConsumer"));
var ApolloProvider_1 = require("./ApolloProvider");
exports.ApolloProvider = ApolloProvider_1.default;
__export(require("./ApolloProvider"));
var Query_1 = require("./Query");
exports.Query = Query_1.default;
__export(require("./Query"));
var Mutation_1 = require("./Mutation");
exports.Mutation = Mutation_1.default;
__export(require("./Mutation"));
var Subscriptions_1 = require("./Subscriptions");
exports.Subscription = Subscriptions_1.default;
__export(require("./Subscriptions"));
var graphql_1 = require("./graphql");
exports.graphql = graphql_1.graphql;
__export(require("./query-hoc"));
__export(require("./mutation-hoc"));
var withApollo_1 = require("./withApollo");
exports.withApollo = withApollo_1.default;
var compose = require('lodash/flowRight');
exports.compose = compose;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=react-apollo.browser.umd.js.map
