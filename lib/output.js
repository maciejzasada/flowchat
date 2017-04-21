export class Output {

  constructor(options) {
    const { text, sessionId } = options;
    if (typeof sessionId === 'undefined') {
      throw new Error('Output must contain a session ID');
    }
    this.text = text || null;
    this.sessionId = sessionId;
  }

}