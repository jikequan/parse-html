import { isHTMLTag, isSVG, isIgnoreNewlineTag, acceptValue } from './makeMap';
import { decodingMap, encodedAttr, modifierRE, validDivisionCharRE, encodedAttrWithNewLines } from '../options';
import { buildRegex } from './cached';

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;

export const isPreTag = tag => tag === 'pre';

export const mustUseProp = (tag, type, attr) => (
  (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
  (attr === 'selected' && tag === 'option') ||
  (attr === 'checked' && tag === 'input') ||
  (attr === 'muted' && tag === 'video')
);

export const isReservedTag = tag => (isHTMLTag(tag) || isSVG(tag));

export const wrapFilter = (exp, filter) => {
  const i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    // ("_f(\"" + filter + "\")(" + exp + ")")
    return `_f("${filter}")(${exp})`;
  }
  const name = filter.slice(0, i);
  const args = filter.slice(i + 1);
  // ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
  return `_f("${name}")(${exp + (args !== ')' ? `,${args}` : args)})`;
};

export const getTagNamespace = tag => {
  if (isSVG(tag)) {
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
export const noop = () => { };

/**
 * Always return false.
 */
export const no = () => false;

export const baseWarn = msg => console.error((`[compiler]: ${msg}`));

export const shouldIgnoreFirstNewline = (tag, html) => (tag && isIgnoreNewlineTag(tag) && html[0] === '\n');

export const decodeAttr = (value, shouldDecodeNewlines) => {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, (match) => decodingMap[match]);
};

export const parseModifiers = name => {
  const match = name.match(modifierRE);
  if (match) {
    const ret = {};
    match.forEach((m) => { ret[m.slice(1)] = true; });
    return ret;
  }
  return null;
};

export const parseFilters = exp => {
  let inSingle = false;
  let inDouble = false;
  let inTemplateString = false;
  let inRegex = false;
  let curly = 0;
  let square = 0;
  let paren = 0;
  let lastFilterIndex = 0;
  let c;
  let prev;
  let i;
  let expression;
  let filters;

  function pushFilter() {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
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
        case 0x22: inDouble = true; break;
        // '
        case 0x27: inSingle = true; break;
        // `
        case 0x60: inTemplateString = true; break;
        // (
        case 0x28: paren++; break;
        // )
        case 0x29: paren--; break;
        // [
        case 0x5B: square++; break;
        // ]
        case 0x5D: square--; break;
        // {
        case 0x7B: curly++; break;
        // }
        case 0x7D: curly--; break;
        default: break;
      }
      if (c === 0x2f) { // /
        let j = i - 1;
        let p = (void 0);
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') { break; }
        }
        if (!p || !validDivisionCharRE.test(p)) {
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

export const parseText = (text, delimiters) => {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return;
  }
  const tokens = [];
  const rawTokens = [];
  let lastIndex = 0;
  tagRE.lastIndex = 0;
  let match;
  let index;
  let tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    const exp = parseFilters(match[1].trim());
    tokens.push(`_s(${exp})`);
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens,
  };
};
