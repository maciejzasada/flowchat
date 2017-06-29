import { sendText } from '../effects/sendText';

export const imageActivator = (input) => {
  return (input.attachments || []).filter(att => att.type === 'image').length !== 0;
}

export const imageReducer = (input, state) => state;

export function* imageSaga(input, state, sessionId) {
  yield sendText('You\'ve sent image!', sessionId);
}

export default [imageActivator, imageReducer, imageSaga];
