import { put } from 'redux-saga/effects';

export const run = function* (flow, data, state, sessionId) {
  yield put({ type: 'run', flow, data, state, sessionId });
}
