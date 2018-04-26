"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var addAttr = exports.addAttr = function addAttr(el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name: name, value: value });
  el.plain = false;
};