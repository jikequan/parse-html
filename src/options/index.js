// Regular Expressions for parsing tags and attributes
export const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
export const ncname = '[a-zA-Z_][\\w\\-\\.]*';

export const qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";

export const startTagOpen = new RegExp(("^<" + qnameCapture));

export const startTagClose = /^\s*(\/?)>/;

export const endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));

export const doctype = /^<!DOCTYPE [^>]+>/i;

// #7298: escape - to avoid being pased as HTML comment when inlined in page
export const comment = /^<!\--/;
export const conditionalComment =  /^<!\[/;

export const decodingMap = {'&lt;': '<', '&gt;': '>', '&quot;': '"', '&amp;': '&', '&#10;': '\n', '&#9;': '\t'};
export const encodedAttr = /&(?:lt|gt|quot|amp);/g;
export const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;

export const onRE = /^@|^v-on:/;
export const dirRE = /^v-|^@|^:/;
export const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
export const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
export const stripParensRE = /^\(|\)$/g;

export const argRE = /:(.*)$/;
export const bindRE = /^:|^v-bind:/;
export const modifierRE = /\.[^.]+/g;

export const IS_REGEX_CAPTURING_BROKEN = (function() {
  let IS_REGEX_CAPTURING_BROKEN = false;
  'x'.replace(/x(.)?/g, function (m, g) {
    IS_REGEX_CAPTURING_BROKEN = g === '';
  });
  return IS_REGEX_CAPTURING_BROKEN;
})()

export const validDivisionCharRE = /[\w).+\-_$\]]/;
