import { sendText } from '../effects/sendText';

export const textActivator = (input) => !!input.text;

export const textReducer = (input, state) => state;

export function* textSaga(input, state, sessionId) {
  yield sendText('You\'ve sent text!', sessionId);
}

export default [textActivator, textReducer, textSaga];
