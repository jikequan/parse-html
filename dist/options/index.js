"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Regular Expressions for parsing tags and attributes
var attribute = exports.attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
var ncname = exports.ncname = '[a-zA-Z_][\\w\\-\\.]*';

var qnameCapture = exports.qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";

var startTagOpen = exports.startTagOpen = new RegExp("^<" + qnameCapture);

var startTagClose = exports.startTagClose = /^\s*(\/?)>/;

var endTag = exports.endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");

var doctype = exports.doctype = /^<!DOCTYPE [^>]+>/i;

// #7298: escape - to avoid being pased as HTML comment when inlined in page
var comment = exports.comment = /^<!\--/;
var conditionalComment = exports.conditionalComment = /^<!\[/;

var decodingMap = exports.decodingMap = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&amp;': '&', '&#10;': '\n', '&#9;': '\t' };
var encodedAttr = exports.encodedAttr = /&(?:lt|gt|quot|amp);/g;
var encodedAttrWithNewLines = exports.encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;

var onRE = exports.onRE = /^@|^v-on:/;
var dirRE = exports.dirRE = /^v-|^@|^:/;
var forAliasRE = exports.forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
var forIteratorRE = exports.forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
var stripParensRE = exports.stripParensRE = /^\(|\)$/g;

var argRE = exports.argRE = /:(.*)$/;
var bindRE = exports.bindRE = /^:|^v-bind:/;
var modifierRE = exports.modifierRE = /\.[^.]+/g;

var IS_REGEX_CAPTURING_BROKEN = exports.IS_REGEX_CAPTURING_BROKEN = function () {
  var IS_REGEX_CAPTURING_BROKEN = false;
  'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === '';
  });
  return IS_REGEX_CAPTURING_BROKEN;
}();

var validDivisionCharRE = exports.validDivisionCharRE = /[\w).+\-_$\]]/;