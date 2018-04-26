'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseText = exports.parseFilters = exports.parseModifiers = exports.decodeAttr = exports.shouldIgnoreFirstNewline = exports.baseWarn = exports.no = exports.noop = exports.getTagNamespace = exports.wrapFilter = exports.isReservedTag = exports.mustUseProp = exports.isPreTag = undefined;

var _makeMap = require('./makeMap');

var _options = require('../options');

var _cached = require('./cached');

var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;

var isPreTag = exports.isPreTag = function isPreTag(tag) {
  return tag === 'pre';
};

var mustUseProp = exports.mustUseProp = function mustUseProp(tag, type, attr) {
  return attr === 'value' && (0, _makeMap.acceptValue)(tag) && type !== 'button' || attr === 'selected' && tag === 'option' || attr === 'checked' && tag === 'input' || attr === 'muted' && tag === 'video';
};

var isReservedTag = exports.isReservedTag = function isReservedTag(tag) {
  return (0, _makeMap.isHTMLTag)(tag) || (0, _makeMap.isSVG)(tag);
};

var wrapFilter = exports.wrapFilter = function wrapFilter(exp, filter) {
  var i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    // ("_f(\"" + filter + "\")(" + exp + ")")
    return '_f("' + filter + '")(' + exp + ')';
  }
  var name = filter.slice(0, i);
  var args = filter.slice(i + 1);
  // ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
  return '_f("' + name + '")(' + (exp + (args !== ')' ? ',' + args : args)) + ')';
};

var getTagNamespace = exports.getTagNamespace = function getTagNamespace(tag) {
  if ((0, _makeMap.isSVG)(tag)) {
    return 'svg';
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math';
  }
  return null;
};

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
var noop = exports.noop = function noop() {};

/**
 * Always return false.
 */
var no = exports.no = function no() {
  return false;
};

var baseWarn = exports.baseWarn = function baseWarn(msg) {
  return console.error('[compiler]: ' + msg);
};

var shouldIgnoreFirstNewline = exports.shouldIgnoreFirstNewline = function shouldIgnoreFirstNewline(tag, html) {
  return tag && (0, _makeMap.isIgnoreNewlineTag)(tag) && html[0] === '\n';
};

var decodeAttr = exports.decodeAttr = function decodeAttr(value, shouldDecodeNewlines) {
  var re = shouldDecodeNewlines ? _options.encodedAttrWithNewLines : _options.encodedAttr;
  return value.replace(re, function (match) {
    return _options.decodingMap[match];
  });
};

var parseModifiers = exports.parseModifiers = function parseModifiers(name) {
  var match = name.match(_options.modifierRE);
  if (match) {
    var ret = {};
    match.forEach(function (m) {
      ret[m.slice(1)] = true;
    });
    return ret;
  }
  return null;
};

var parseFilters = exports.parseFilters = function parseFilters(exp) {
  var inSingle = false;
  var inDouble = false;
  var inTemplateString = false;
  var inRegex = false;
  var curly = 0;
  var square = 0;
  var paren = 0;
  var lastFilterIndex = 0;
  var c = void 0;
  var prev = void 0;
  var i = void 0;
  var expression = void 0;
  var filters = void 0;

  function pushFilter() {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) {
        inSingle = false;
      }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) {
        inDouble = false;
      }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) {
        inTemplateString = false;
      }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) {
        inRegex = false;
      }
    } else if (c === 0x7C && // pipe
    exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        // "
        case 0x22:
          inDouble = true;break;
        // '
        case 0x27:
          inSingle = true;break;
        // `
        case 0x60:
          inTemplateString = true;break;
        // (
        case 0x28:
          paren++;break;
        // )
        case 0x29:
          paren--;break;
        // [
        case 0x5B:
          square++;break;
        // ]
        case 0x5D:
          square--;break;
        // {
        case 0x7B:
          curly++;break;
        // }
        case 0x7D:
          curly--;break;
        default:
          break;
      }
      if (c === 0x2f) {
        // /
        var j = i - 1;
        var p = void 0;
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') {
            break;
          }
        }
        if (!p || !_options.validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression;
};

var parseText = exports.parseText = function parseText(text, delimiters) {
  var tagRE = delimiters ? (0, _cached.buildRegex)(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return;
  }
  var tokens = [];
  var rawTokens = [];
  var lastIndex = 0;
  tagRE.lastIndex = 0;
  var match = void 0;
  var index = void 0;
  var tokenValue = void 0;
  while (match = tagRE.exec(text)) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push('_s(' + exp + ')');
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  };
};