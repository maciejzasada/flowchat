'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.input = exports.send = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _effects = require('redux-saga/effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const send = exports.send = _regenerator2.default.mark(function _callee(data, state, sessionId) {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return (0, _effects.put)({ type: 'send', data, state, sessionId });

      case 2:
      case 'end':
        return _context.stop();
    }
  }, _callee, this);
});

const input = exports.input = _regenerator2.default.mark(function _callee2(data, state, sessionId) {
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) switch (_context2.prev = _context2.next) {
      case 0:
        _context2.next = 2;
        return (0, _effects.put)({ type: 'input', data, state, sessionId });

      case 2:
      case 'end':
        return _context2.stop();
    }
  }, _callee2, this);
});

const run = exports.run = _regenerator2.default.mark(function _callee3(flow, data, state, sessionId) {
  return _regenerator2.default.wrap(function _callee3$(_context3) {
    while (1) switch (_context3.prev = _context3.next) {
      case 0:
        _context3.next = 2;
        return (0, _effects.put)({ type: 'run', flow, data, state, sessionId });

      case 2:
      case 'end':
        return _context3.stop();
    }
  }, _callee3, this);
});