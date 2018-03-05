"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./parser");
var query_hoc_1 = require("./query-hoc");
var mutation_hoc_1 = require("./mutation-hoc");
var subscription_hoc_1 = require("./subscription-hoc");
function graphql(document, operationOptions) {
    if (operationOptions === void 0) { operationOptions = {}; }
    switch (parser_1.parser(document).type) {
        case parser_1.DocumentType.Mutation:
            return mutation_hoc_1.mutation(document, operationOptions);
        case parser_1.DocumentType.Subscription:
            return subscription_hoc_1.subscribe(document, operationOptions);
        case parser_1.DocumentType.Query:
        default:
            return query_hoc_1.query(document, operationOptions, true);
    }
}
exports.graphql = graphql;
//# sourceMappingURL=graphql.js.map