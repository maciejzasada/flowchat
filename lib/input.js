export class Input {

  constructor(options) {
    if (typeof options === 'undefined') {
      throw new Error('Input must contain options');
    }
    if (typeof options.sessionId === 'undefined') {
      throw new Error('Input must come with a session ID');
    }

    for (let key in options) {
      this[key] = options[key];
    }
  }

}