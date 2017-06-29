import { put } from 'redux-saga/effects';

export const sendText = function* (data, sessionId) {
  yield put({ type: 'send', data: { text: data }, sessionId });
}
