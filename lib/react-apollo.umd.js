(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['react-apollo'] = {})));
}(this, (function (exports) { 'use strict';

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./browser"));
var renderToStringWithData_1 = require("./renderToStringWithData");
exports.renderToStringWithData = renderToStringWithData_1.renderToStringWithData;

Object.defineProperty(exports, '__esModule', { value: true });

})));
