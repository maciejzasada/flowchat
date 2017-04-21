import { call } from 'redux-saga/effects';

export const helloActivator = (state, input) => {
  return Promise.resolve(true);
}

export const helloReducer = (state, action) => {
  console.log('-- running hello reducer');
  return state;
}

export function* helloSaga(action) {
  const send = action.payload.send;
  console.log('-- hello saga called');
  yield call(send, 'Nice one, buddy with call!');
}

export const helloFlow = [helloActivator, helloReducer, helloSaga];
