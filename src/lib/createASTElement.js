import { isIE, isEdge } from '../utils/browser';
import { baseWarn } from '../utils';

function makeAttrsMap(attrs) {
  const map = {};
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (map[attrs[i].name] && !isIE && !isEdge) {
      baseWarn(`duplicate attribute: ${attrs[i].name}`);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map;
}

function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: [],
  };
}

export default createASTElement;
