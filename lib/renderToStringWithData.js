"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReactDOM = require("react-dom/server");
var getDataFromTree_1 = require("./getDataFromTree");
function renderToStringWithData(component) {
    return getDataFromTree_1.default(component).then(function () { return ReactDOM.renderToString(component); });
}
exports.renderToStringWithData = renderToStringWithData;
//# sourceMappingURL=renderToStringWithData.js.map