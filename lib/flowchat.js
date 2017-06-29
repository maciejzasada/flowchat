/**
 * @external {Subject} http://reactivex.io/documentation/subject.html
 */

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Subject } from 'rx-lite';

/**
 * Flowchat chat bot class
 * 
 * @export
 * @class Flowchat
 */
export class Flowchat {

  /**
   * Creates an instance of Flowchat.
   * 
   * @memberOf Flowchat
   */
  constructor() {
    const self = this;

    this._inputSubscription = null;
    this.setInput(new Subject());
    this._state = new Subject();
    this._output = new Subject();
    this._activators = [];
    this._paths = [];
    this._reducers = {};
    this._sagas = {};
    this._sagaMiddleware = createSagaMiddleware();
    this._store = createStore(
      (state) => state,
      applyMiddleware(this._sagaMiddleware)
    );

    // Set up internal sagas.

    // Send.
    this._sendSaga = function* sendSaga({ data, sessionId }) {
      yield self._send(data, sessionId);
    }
    this._sendSagaRunner = function* sendSagaRunner() {
      yield takeEvery('send', self._sendSaga);
    };
    this._sagaMiddleware.run(this._sendSagaRunner);

    // Input.
    this._inputSaga = function* inputSaga({ data, state, sessionId }) {
      yield self._receive({ data, state, sessionId });
    }
    this._inputSagaRunner = function* inputSagaRunner() {
      yield takeEvery('input', self._inputSaga);
    };
    this._sagaMiddleware.run(this._inputSagaRunner);

    // Run.
    this._runSaga = function* runSaga({ flow, data, state, sessionId }) {
      yield self._run(flow, data, state, sessionId);
    }
    this._runSagaRunner = function* runSagaRunner() {
      yield takeEvery('run', self._runSaga);
    };
    this._sagaMiddleware.run(this._runSagaRunner);
  }

  /**
   * Chat bot's input Subject.
   * Requires the input object passed to contain "state" and "sessionId". Use "data" for the actual
   * input data.
   * 
   * @type {Subject}
   * @readonly
   * 
   * @example <caption>Passing input to the chat bot</caption>
   * bot.input.onNext({data: "Hey, chat bot!", state: {saidHello: false}, 123});
   * 
   * @memberOf Flowchat
   */
  get input() {
    return this._input;
  }

  /**
   * Chat bot's output Subject.
   * Passes an object containing "data" (the actual output sent by a saga) and "sessionId" to map
   * the output to the correct user.
   * 
   * @type {Subject}
   * @readonly
   * 
   * @example <caption>Reading the bot's output and logging it to the console</caption>
   * bot.output.subscribe(({ data, sessionId }) => console.log(data));
   * 
   * @memberOf Flowchat
   */
  get output() {
    return this._output;
  }

  /**
   * Conversation state Subject.
   * Passes state updates for a specific sessionId.
   * The update state needs to be stored and passed with future inputs to correctly maintain the
   * logic.
   * 
   * @type {Subject}
   * @readonly
   * 
   * @example <caption>Subscribe to state updates</caption>
   * bot.state.subscribe(({ state, sessionId }) => {
   *  console.log('New state:', state, 'for', sessionId);
   * });
   * 
   * @example <caption>Simple local session (example only, not a production solution)</caption>
   * let sessionId = 1; // assume the user's sessionId is 1
   * const session = {};  // create a local in-memory session store
   * const INITIAL_STATE = { saidHello: false };  // define initial state for each user
   * session[sessionId] = Object.assign({}, INITIAL_STATE); // set a copy of the initial state for
   *                                                        // the user
   * // ...
   * // store state updates
   * bot.state.subscribe(({ state, sessionId }) => session[sessionId] = state;
   * 
   * @memberOf Flowchat
   */
  get state() {
    return this._state;
  }

  /**
   * Allows replacing the bot's input with a different Subject.
   * 
   * @param {Subject} input the new input
   * 
   * @memberOf Flowchat
   */
  setInput(input) {
    if (this._input) {
      this._input.dispose();
      this._inputSubscription.dispose();
    }
    this._input = input;
    this._inputSubscription = this._input.subscribe(this._receive.bind(this));
  }

  /**
   * Defines a new flow.
   * 
   * @param {string} flowPath flow identifier / path
   * @param {function} activator function that will determine whether the flow should run
   * @param {function} reducer redux reducer for state updates
   * @param {Generator} saga redux-saga saga, the main flow body
   * 
   * @memberOf Flowchat
   */
  flow(flowPath, activator, reducer, saga) {
    if (arguments.length !== 4) {
      throw new Error('flow requires exactly 4 arguments');
    }

    if (Flowchat.RESTRICTED_FLOWS.indexOf(flowPath) !== -1) {
      throw new Error(`Flow ${flowPath} is restricted for internal use`);
    }

    this._paths.push(flowPath);
    this._activators.push(activator);
    this._reducers[flowPath] = reducer;

    const watchableSaga = function* wSaga({ data, state, sessionId }) {
      // TODO: watch this saga for end.
      yield call(saga, data, state, sessionId);
    }

    this._sagas[flowPath] = function* flowSaga() {
      yield takeEvery(flowPath, watchableSaga);
    };

    this._sagaMiddleware.run(this._sagas[flowPath]);
  }
  
  /**
   * Allows specifying multiple flows with a map object.
   * 
   * @param {Object} flowsMap {path: [activator, reducer, saga]}
   * 
   * @memberof Flowchat
   */
  flows(flowsMap) {
    for(let key of Object.keys(flowsMap)) {
      this.flow(key, ...flowsMap[key]);
    }
  }

  _receive({ data, state, sessionId }) {
    if (typeof state === 'undefined') {
      throw new Error('Input state must be defined');
    }

    if (typeof sessionId === 'undefined') {
      throw new Error('Input sessionId must be defined');
    }

    // Activate flows.
    const activationPromises = this._activators.map(activator => activator(data, state, sessionId));
    return Promise.all(activationPromises)
    .then(toActivate => {
      const activeIndices = toActivate
        .map((activate, index) => activate ? index : undefined)
        .filter(index => index !== undefined);
      
      if (activeIndices.length === 0) {
        this._run('*', data, state, sessionId);
      } else {
        activeIndices.forEach(index => {
          this._run(this._paths[index], data, state, sessionId);
        });
      }
    });
  }

  _run(flow, data, state, sessionId) {
    const newState = this._reduce(flow, data, state, sessionId);
    const runNext = () => {
      this._store.dispatch({ type: flow, data, state: newState, sessionId });
    }
    let waitFor = null;
    const wait = (promise) => {
      waitFor = promise;
    }
    this._state.onNext({ state: newState, sessionId, wait });
    if (!waitFor) {
      waitFor = Promise.resolve();
    }
    waitFor.then(runNext);
  }

  _reduce(flow, data, state, sessionId) {
    const subReducer = this._reducers[flow];
    if (typeof subReducer === 'function') {
      return subReducer(data, state, sessionId);
    }
    if (Flowchat.RESTRICTED_FLOWS.indexOf(flow) === -1) {
      console.warn('Unhandled flow', flow);
      this._send(null, sessionId);
    }
    return state;
  }

  _send(data, sessionId) {
    this._output.onNext({ data, sessionId });
  }

}

Flowchat.RESTRICTED_FLOWS = [
  'send',
  'input',
  'run'
];
