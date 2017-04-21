export class Input {

  constructor(options) {
    const { text, sessionId } = options;
    if (typeof sessionId === 'undefined') {
      throw new Error('Input must come with a session ID');
    }
    this.text = text || null;
    this.sessionId = sessionId;
  }

}