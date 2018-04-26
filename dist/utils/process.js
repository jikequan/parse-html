'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processRef = exports.processKey = exports.processComponent = exports.processSlot = exports.processOnce = exports.processIfConditions = exports.processIf = exports.processFor = exports.processPre = undefined;

var _getBindingAttr = require('./getBindingAttr');

var _options = require('../options');

var _element = require('./element');

function getAndRemoveAttr(el, name, removeFromMap) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val;
}

function findPrevElement(children) {
  var i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i];
    } else {
      if ("development" !== 'production' && children[i].text !== ' ') {
        warn$1("text \"" + children[i].text.trim() + "\" between v-if and v-else(-if) " + "will be ignored.");
      }
      children.pop();
    }
  }
}

var processPre = exports.processPre = function processPre(el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
};

var processFor = exports.processFor = function processFor(el) {
  var exp;
  if (exp = getAndRemoveAttr(el, 'v-for')) {
    var res = parseFor(exp);
    if (res) {
      extend(el, res);
    } else {
      warn$1("Invalid v-for expression: " + exp);
    }
  }
};

var processIf = exports.processIf = function processIf(el) {
  var exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
};

var processIfConditions = exports.processIfConditions = function processIfConditions(el, parent) {
  var prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else {
    warn$1("v-" + (el.elseif ? 'else-if="' + el.elseif + '"' : 'else') + " " + "used on element <" + el.tag + "> without corresponding v-if.");
  }
};

var processOnce = exports.processOnce = function processOnce(el) {
  var once$$1 = getAndRemoveAttr(el, 'v-once');
  if (once$$1 != null) {
    el.once = true;
  }
};

var processSlot = exports.processSlot = function processSlot(el) {
  if (el.tag === 'slot') {
    el.slotName = (0, _getBindingAttr.getBindingAttr)(el, 'name');
    if ("development" !== 'production' && el.key) {
      warn$1("`key` does not work on <slot> because slots are abstract outlets " + "and can possibly expand into multiple elements. " + "Use the key on a wrapping element instead.");
    }
  } else {
    var slotScope;
    if (el.tag === 'template') {
      slotScope = getAndRemoveAttr(el, 'scope');
      /* istanbul ignore if */
      if ("development" !== 'production' && slotScope) {
        warn$1("the \"scope\" attribute for scoped slots have been deprecated and " + "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " + "can also be used on plain elements in addition to <template> to " + "denote scoped slots.", true);
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
    } else if (slotScope = getAndRemoveAttr(el, 'slot-scope')) {
      /* istanbul ignore if */
      if ("development" !== 'production' && el.attrsMap['v-for']) {
        warn$1("Ambiguous combined usage of slot-scope and v-for on <" + el.tag + "> " + "(v-for takes higher priority). Use a wrapper <template> for the " + "scoped slot to make it clearer.", true);
      }
      el.slotScope = slotScope;
    }
    var slotTarget = (0, _getBindingAttr.getBindingAttr)(el, 'slot');
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
      // preserve slot as an attribute for native shadow DOM compat
      // only for non-scoped slots.
      if (el.tag !== 'template' && !el.slotScope) {
        (0, _element.addAttr)(el, 'slot', slotTarget);
      }
    }
  }
};

var processComponent = exports.processComponent = function processComponent(el) {
  var binding;
  if (binding = (0, _getBindingAttr.getBindingAttr)(el, 'is')) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
};

var processKey = exports.processKey = function processKey(el) {
  var exp = (0, _getBindingAttr.getBindingAttr)(el, 'key');
  if (exp) {
    if ("development" !== 'production' && el.tag === 'template') {
      warn$1("<template> cannot be keyed. Place the key on real elements instead.");
    }
    el.key = exp;
  }
};

var processRef = exports.processRef = function processRef(el) {
  var ref = (0, _getBindingAttr.getBindingAttr)(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
};