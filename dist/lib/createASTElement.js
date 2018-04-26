'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _browser = require('../utils/browser');

var _utils = require('../utils');

function makeAttrsMap(attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    if (map[attrs[i].name] && !_browser.isIE && !_browser.isEdge) {
      (0, _utils.baseWarn)('duplicate attribute: ' + attrs[i].name);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map;
}

function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag: tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent: parent,
    children: []
  };
}

exports.default = createASTElement;