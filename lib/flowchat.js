import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Subject } from 'rx-lite';

export class Flowchat {

  static RESTRICTED_FLOWS = [
    'send',
    'input',
    'run'
  ];

  constructor() {
    const self = this;

    this.input = new Subject();
    this.inputSubscription = null;
    this.setInput(this.input);
    this.output = new Subject();
    this.activators = [];
    this.paths = [];
    this.reducers = {};
    this.sagas = {};
    this.sagaMiddleware = createSagaMiddleware();
    this.store = createStore(
      (state) => state,
      applyMiddleware(this.sagaMiddleware)
    );

    // Set up internal sagas.

    // Send.
    this.sendSaga = function* sendSaga({ data, state, sessionId }) {
      self.send(data, state, sessionId);
    }
    this.sendSagaRunner = function* sendSagaRunner() {
      yield takeEvery('send', self.sendSaga);
    };
    this.sagaMiddleware.run(this.sendSagaRunner);

    // Input.
    this.inputSaga = function* inputSaga({ data, state, sessionId }) {
      self.receive({ data, state, sessionId });
    }
    this.inputSagaRunner = function* inputSagaRunner() {
      yield takeEvery('input', self.inputSaga);
    };
    this.sagaMiddleware.run(this.inputSagaRunner);

    // Run.
    this.runSaga = function* runSaga({ flow, data, state, sessionId }) {
      self.run(flow, data, state, sessionId);
    }
    this.runSagaRunner = function* runSagaRunner() {
      yield takeEvery('run', self.runSaga);
    };
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
    const watchableSaga = function* wSaga(action) {
      // TODO: watch this saga for end.
      yield call(saga, action.data, action.state, action.sessionId);
    }
    this.sagas[flowPath] = function* flowSaga() {
      yield takeEvery(flowPath, watchableSaga);
    };
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
    return Promise.all(activationPromises)
    .then(toActivate => {
      const activeIndices = toActivate
        .map((activate, index) => activate ? index : undefined)
        .filter(index => index !== undefined);
      
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
    const newState = this.reduce(flow, data, state, sessionId)
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
