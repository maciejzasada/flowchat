'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Flowchat = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _redux = require('redux');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require('redux-saga/effects');

var _rxLite = require('rx-lite');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Flowchat {

  constructor() {
    const self = this;

    this.input = new _rxLite.Subject();
    this.inputSubscription = null;
    this.setInput(this.input);
    this.output = new _rxLite.Subject();
    this.activators = [];
    this.paths = [];
    this.reducers = {};
    this.sagas = {};
    this.sagaMiddleware = (0, _reduxSaga2.default)();
    this.store = (0, _redux.createStore)(state => state, (0, _redux.applyMiddleware)(this.sagaMiddleware));

    // Set up internal sagas.

    // Send.
    this.sendSaga = _regenerator2.default.mark(function sendSaga({ data, state, sessionId }) {
      return _regenerator2.default.wrap(function sendSaga$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            self.send(data, state, sessionId);

          case 1:
          case 'end':
            return _context.stop();
        }
      }, sendSaga, this);
    });
    this.sendSagaRunner = _regenerator2.default.mark(function sendSagaRunner() {
      return _regenerator2.default.wrap(function sendSagaRunner$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _reduxSaga.takeEvery)('send', self.sendSaga);

          case 2:
          case 'end':
            return _context2.stop();
        }
      }, sendSagaRunner, this);
    });
    this.sagaMiddleware.run(this.sendSagaRunner);

    // Input.
    this.inputSaga = _regenerator2.default.mark(function inputSaga({ data, state, sessionId }) {
      return _regenerator2.default.wrap(function inputSaga$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            self.receive({ data, state, sessionId });

          case 1:
          case 'end':
            return _context3.stop();
        }
      }, inputSaga, this);
    });
    this.inputSagaRunner = _regenerator2.default.mark(function inputSagaRunner() {
      return _regenerator2.default.wrap(function inputSagaRunner$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (0, _reduxSaga.takeEvery)('input', self.inputSaga);

          case 2:
          case 'end':
            return _context4.stop();
        }
      }, inputSagaRunner, this);
    });
    this.sagaMiddleware.run(this.inputSagaRunner);

    // Run.
    this.runSaga = _regenerator2.default.mark(function runSaga({ flow, data, state, sessionId }) {
      return _regenerator2.default.wrap(function runSaga$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            self.run(flow, data, state, sessionId);

          case 1:
          case 'end':
            return _context5.stop();
        }
      }, runSaga, this);
    });
    this.runSagaRunner = _regenerator2.default.mark(function runSagaRunner() {
      return _regenerator2.default.wrap(function runSagaRunner$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _reduxSaga.takeEvery)('run', self.runSaga);

          case 2:
          case 'end':
            return _context6.stop();
        }
      }, runSagaRunner, this);
    });
    this.sagaMiddleware.run(this.runSagaRunner);
  }

  /* public */
  setInput(input) {
    if (this.inputSubscription) {
      this.inputSubscription.dispose();
    }
    this.inputSubscription = input.subscribe(this.receive.bind(this));
  }

  flow(flowPath, activator, reducer, saga) {
    if (Flowchat.RESTRICTED_FLOWS.indexOf(flowPath) !== -1) {
      throw new Error(`Flow ${flowPath} is restricted for internal use.`);
    }

    this.paths.push(flowPath);
    this.activators.push(activator);
    this.reducers[flowPath] = reducer;
    const watchableSaga = _regenerator2.default.mark(function wSaga(action) {
      return _regenerator2.default.wrap(function wSaga$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return (0, _effects.call)(saga, action.data, action.state, action.sessionId);

          case 2:
          case 'end':
            return _context7.stop();
        }
      }, wSaga, this);
    });
    this.sagas[flowPath] = _regenerator2.default.mark(function flowSaga() {
      return _regenerator2.default.wrap(function flowSaga$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return (0, _reduxSaga.takeEvery)(flowPath, watchableSaga);

          case 2:
          case 'end':
            return _context8.stop();
        }
      }, flowSaga, this);
    });
    this.sagaMiddleware.run(this.sagas[flowPath]);
  }

  /* private */
  receive({ data, state, sessionId }) {
    if (typeof state === 'undefined') {
      throw new Error('Input state must be defined');
    }

    if (typeof sessionId === 'undefined') {
      throw new Error('Input sessionId must be defined');
    }

    // Activate flows.
    const activationPromises = this.activators.map(activator => activator(data, state));
    return _promise2.default.all(activationPromises).then(toActivate => {
      const activeIndices = toActivate.map((activate, index) => activate ? index : undefined).filter(index => index !== undefined);

      if (activeIndices.length === 0) {
        this.run('*', data, state, sessionId);
      } else {
        activeIndices.forEach(index => {
          this.run(this.paths[index], data, state, sessionId);
        });
      }
    });
  }

  run(flow, data, state, sessionId) {
    const newState = this.reduce(flow, data, state, sessionId);
    this.store.dispatch({ type: flow, data, state: newState, sessionId });
  }

  reduce(flow, data, state, sessionId) {
    const subReducer = this.reducers[flow];
    if (typeof subReducer === 'function') {
      return subReducer(data, state, sessionId);
    }
    if (Flowchat.RESTRICTED_FLOWS.indexOf(flow) === -1) {
      console.warn('Unhandled flow', flow);
      this.send(null, data, state, sessionId);
    }
    return state;
  }

  send(data, state, sessionId) {
    this.output.onNext({ data, state, sessionId });
  }

}
exports.Flowchat = Flowchat;
Flowchat.RESTRICTED_FLOWS = ['send', 'input', 'run'];