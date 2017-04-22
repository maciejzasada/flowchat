'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.helloSaga = helloSaga;

var _effects = require('redux-saga/effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [helloSaga].map(_regenerator2.default.mark);

function helloSaga(action) {
  var send;
  return _regenerator2.default.wrap(function helloSaga$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        send = action.payload.send;

        console.log('-- hello saga called');
        _context.next = 4;
        return (0, _effects.call)(send, 'Nice one, buddy with call!');

      case 4:
      case 'end':
        return _context.stop();
    }
  }, _marked[0], this);
}