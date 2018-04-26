'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parseHTML = require('./lib/parseHTML');

var _parseHTML2 = _interopRequireDefault(_parseHTML);

var _parse = require('./lib/parse');

var _parse2 = _interopRequireDefault(_parse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  parseHTML: _parseHTML2.default,
  parse: _parse2.default
};