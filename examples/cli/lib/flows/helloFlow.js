import { send } from 'flowchat';

export const helloActivator = (input) => input === 'hello';

export const helloReducer = (input, state) => {
  console.log('-- running hello reducer', input, state);
  return Object.assign({}, state, {saidHello: true});
}

export function* helloSaga(input, state, sessionId) {
  // const send = action.payload.send;
  console.log('-- hello saga called', input, state, sessionId);
  yield send('Nice one, buddy with call!', state, sessionId);
}

export const helloFlow = [helloActivator, helloReducer, helloSaga];
