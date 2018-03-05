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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var apollo_client_1 = require("apollo-client");
var apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
var _1 = require("./");
var test_links_1 = require("./test-links");
__export(require("./test-links"));
var MockedProvider = (function (_super) {
    __extends(MockedProvider, _super);
    function MockedProvider(props, context) {
        var _this = _super.call(this, props, context) || this;
        if (_this.props.client)
            return _this;
        var addTypename = !_this.props.removeTypename;
        var link = test_links_1.mockSingleLink.apply(null, _this.props.mocks);
        _this.client = new apollo_client_1.default({
            link: link,
            cache: new apollo_cache_inmemory_1.InMemoryCache({ addTypename: addTypename }),
            defaultOptions: _this.props.defaultOptions,
        });
        return _this;
    }
    MockedProvider.prototype.render = function () {
        return (React.createElement(_1.ApolloProvider, { client: this.client || this.props.client }, this.props.children));
    };
    return MockedProvider;
}(React.Component));
exports.MockedProvider = MockedProvider;
//# sourceMappingURL=test-utils.js.map