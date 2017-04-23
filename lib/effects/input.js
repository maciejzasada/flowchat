import { put } from 'redux-saga/effects';

export const input = function* (data, state, sessionId) {
  yield put({ type: 'input', data, state, sessionId });
}
