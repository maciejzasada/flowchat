export class Output {

  constructor(options) {
    if (typeof options.sessionId === 'undefined') {
      throw new Error('Output must contain a session ID');
    }

    for (let key in options) {
      this[key] = options[key];
    }
  }

}