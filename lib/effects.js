import { put } from 'redux-saga/effects';

export const send = function* (data, state, sessionId) {
  yield put({ type: 'send', data, state, sessionId });
}

export const input = function* (data, state, sessionId) {
  yield put({ type: 'input', data, state, sessionId });
}

export const run = function* (flow, data, state, sessionId) {
  yield put({ type: 'run', flow, data, state, sessionId });
}
