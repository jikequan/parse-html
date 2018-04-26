export const addAttr = function (el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name: name, value: value });
  el.plain = false;
}
