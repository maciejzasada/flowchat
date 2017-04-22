'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class Output {

  constructor(data, state, sessionId) {
    if (typeof state === 'undefined') {
      throw new Error('Input must come with a defined state');
    }

    if (typeof sessionId === 'undefined') {
      throw new Error('Output must contain a session ID');
    }

    this.data = data;
    this.state = state;
    this.sessionId = sessionId;
  }

}
exports.Output = Output;