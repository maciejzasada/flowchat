import { Observable } from 'rx-lite';

import { Input } from './input';
import { Output } from './output';

export class Flowchat {

  constructor() {
    this.middlewares = [];
    this.output = Observable.create(observer => this.outputObserver = observer);
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  input(rawInput, sessionId, extra) {
    if (!(rawInput instanceof Input)) {
      throw new Error('input must be instance of Input');
    }
    return this.runMiddlewares(rawInput, sessionId, extra)
    .then(processedInput => {
      return this.reply(processedInput, sessionId, extra);
    });
  }

  runMiddlewares(rawInput, sessionId, extra) {
    const flow = this.middlewares.concat();
    let result = Promise.resolve(rawInput);
    flow.forEach(step => {
      result = result.then(processedInput => step(processedInput, sessionId, extra));
    });
    return result;
  }

  reply(input) {
    console.log('replying to input', input);
    this.send(new Output({ text: 'This is a test output' }));
    return Promise.resolve();
  }

  send(output) {
    this.outputObserver.next(output);
  }

}