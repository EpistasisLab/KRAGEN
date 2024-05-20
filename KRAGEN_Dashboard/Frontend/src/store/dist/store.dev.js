"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _zustand = require("zustand");

var _middleware = require("zustand/middleware");

var useStore = (0, _zustand.create)((0, _middleware.devtools)(function (set) {
  return {
    // test counter
    count: 0,
    increment: function increment() {
      return set(function (state) {
        return {
          count: state.count + 1
        };
      });
    },
    decrement: function decrement() {
      return set(function (state) {
        return {
          count: state.count - 1
        };
      });
    },
    // current clicked node
    descriptionForClickedNode: "",
    setDescriptionForClickedNode: function setDescriptionForClickedNode(description) {
      return set(function () {
        return {
          descriptionForClickedNode: description
        };
      });
    },
    // current generate node click id
    currentGenerateNodeClickId: 0,
    setCurrentGenerateNodeClickId: function setCurrentGenerateNodeClickId(id) {
      return set(function () {
        return {
          currentGenerateNodeClickId: id
        };
      });
    }
  };
}));
var _default = useStore;
exports["default"] = _default;