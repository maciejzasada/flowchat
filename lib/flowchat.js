import * as path from 'path';

import { Subject } from 'rx-lite';

import { Input } from './input';
import { Output } from './output';

export class Flowchat {

  constructor() {
    this.input = new Subject();
    this.output = new Subject();
    this.inputSubscription = null;
    this.intents = {};
    this.setInput(this.input);
  }

  /* public */
  setInput(input) {
    if (this.inputSubscription) {
      this.inputSubscription.dispose();
    }
    this.inputSubscription = input.subscribe(this.receive.bind(this));
  }

  intent(intentPath, intent) {
    if (typeof intent === 'object') {
      for (let key in intent) {
        this.intent(path.join(intentPath, key).replace(/\/$/, ''), intent[key]);
      }
    } else if (typeof intent === 'function') {
      console.log('-- register', intentPath);
      this.intents[intentPath] = intent;
    } else {
      throw new Error('Unsupported intent type');
    }
  }

  /* private */
  receive(input) {
    // Define a scoped sender function that knows the sessionId.
    const send = (output) => {
      let wrappedOutput;
      if (typeof output === 'string') {
        wrappedOutput = new Output({ text: output, sessionId: input.sessionId });
      } else {
        let outputOpts = Object.assign({}, output, { sessionId: input.sessionId });
        wrappedOutput = new Output(outputOpts);
      }
      return this.send(wrappedOutput);
    };

    // Define a scoped receive function.
    const receive = this.receive.bind(this);

    // Find the generator responsible for hanlding this intent.
    let generator;
    if (input.intentPath && this.intents[input.intentPath]) {
      generator = this.intents[input.intentPath](input, send, receive);
    } else if (this.intents['*']) {
      generator = this.intents['*'](input, send, receive);
    }

    // Execute the generator.
    while(!generator.next().done);
  }

  send(output) {
    this.output.onNext(output);
  }

}