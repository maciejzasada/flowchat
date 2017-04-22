'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (input) {
  input.intentPath = '/hello';
  return _rxLite.Observable.return(input);
};

var _rxLite = require('rx-lite');