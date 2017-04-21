import { call } from 'redux-saga/effects';

export function* helloSaga(action) {
  const send = action.payload.send;
  console.log('-- hello saga called');
  yield call(send, 'Nice one, buddy with call!');
}