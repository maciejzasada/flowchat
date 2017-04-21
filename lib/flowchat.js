import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware, { takeEvery } from 'redux-saga';
import { call } from 'redux-saga/effects';
import { Subject } from 'rx-lite';

import { Output } from './output';

export class Flowchat {

  constructor() {
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
      this.reduce.bind(this),
      applyMiddleware(this.sagaMiddleware)
    );
  }

  /* public */
  setInput(input) {
    if (this.inputSubscription) {
      this.inputSubscription.dispose();
    }
    this.inputSubscription = input.subscribe(this.receive.bind(this));
  }

  flow(flowPath, activator, reducer, saga) {
    this.paths.push(flowPath);
    this.activators.push(activator);
    this.reducers[flowPath] = reducer;
    const watchableSaga = function* wSaga(action) {
      // TODO: watch this saga for end.
      yield call(saga, action);
    }
    this.sagas[flowPath] = function* flowSaga() {
      yield takeEvery(flowPath, watchableSaga);
    };
    this.sagaMiddleware.run(this.sagas[flowPath]);
  }

  /* private */
  receive(input) {
    // TODO: transport state via input.
    const state = {};

    // Define a scoped sender function that knows the sessionId.
    const send = (output) => {
      let wrappedOutput;
      if (typeof output === 'string') {
        wrappedOutput = new Output({ text: output, sessionId: input.sessionId });
      } else {
        let outputOpts = Object.assign({}, output, { sessionId: input.sessionId });
        wrappedOutput = new Output(outputOpts);
      }
      return this.send(wrappedOutput);
    };

    // Define a scoped receive function.
    const receive = this.receive.bind(this);

    const payload = {
      send,
      receive
    };

    // Activate flows.
    const activationPromises = this.activators.map(activator => activator(state, input));
    return Promise.all(activationPromises)
    .then(toActivate => {
      const activeIndices = toActivate
        .map((activate, index) => activate ? index : undefined)
        .filter(index => index !== undefined);
      
      if (activeIndices.length === 0) {
        this.store.dispatch({ type: '*', payload });
      } else {
        activeIndices.forEach(index => {
          this.store.dispatch({ type: this.paths[index], payload });
        });
      }
    });

    // Dispatch the flow.
    // this.store.dispatch({
    //   type: input.intentPath || '*',
    //   payload: {
    //     send,
    //     receive
    //   }
    // });
  }

  reduce(state = {}, action) {
    const subReducer = this.reducers[action.type];
    if (typeof subReducer === 'function') {
      return subReducer(state, action);
    }
    console.warn('Unhandled flow path', action.type);
    return state;
  }

  send(output) {
    this.output.onNext(output);
  }

}
