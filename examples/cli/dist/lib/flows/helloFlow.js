'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.helloFlow = exports.helloReducer = exports.helloActivator = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.helloSaga = helloSaga;

var _flowchat = require('flowchat');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [helloSaga].map(_regenerator2.default.mark);

const helloActivator = exports.helloActivator = input => input === 'hello';

const helloReducer = exports.helloReducer = (input, state) => {
  console.log('-- running hello reducer', input, state);
  return (0, _assign2.default)({}, state, { saidHello: true });
};

function helloSaga(input, state, sessionId) {
  return _regenerator2.default.wrap(function helloSaga$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        // const send = action.payload.send;
        console.log('-- hello saga called', input, state, sessionId);
        _context.next = 3;
        return (0, _flowchat.send)('Nice one, buddy with call!', state, sessionId);

      case 3:
      case 'end':
        return _context.stop();
    }
  }, _marked[0], this);
}

const helloFlow = exports.helloFlow = [helloActivator, helloReducer, helloSaga];