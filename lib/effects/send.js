import { put } from 'redux-saga/effects';

export const send = function* (data, sessionId) {
  yield put({ type: 'send', data, sessionId });
}
