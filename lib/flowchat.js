import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware, { takeEvery } from 'redux-saga';
import { Subject } from 'rx-lite';

import { Input } from './input';
import { Output } from './output';

export class Flowchat {

  constructor() {
    this.input = new Subject();
    this.inputSubscription = null;
    this.setInput(this.input);
    this.output = new Subject();
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

  intent(intentPath, reducer, saga) {
    this.reducers[intentPath] = reducer;
    this.sagas[intentPath] = function* intentSaga() {
      yield takeEvery(intentPath, saga);
    };
    this.sagaMiddleware.run(this.sagas[intentPath]);
  }

  /* private */
  receive(input) {
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

    // Dispatch the flow.
    this.store.dispatch({
      type: input.intentPath || '*',
      payload: {
        send,
        receive
      }
    });
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