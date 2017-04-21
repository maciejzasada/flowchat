export default {

  '/': function* (input, send, receive) {
    console.log('-- handling the flow', input);
    yield* send('This is a test message from a handler');
  }

};
