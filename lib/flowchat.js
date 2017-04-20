import { Subject } from 'rx-lite';

import { Input } from './input';
import { Output } from './output';

export class Flowchat {

  constructor() {
    this.input = new Subject();
    this.output = new Subject();
    this.inputSubscription = null;
    this.setInput(this.input);
  }

  setInput(input) {
    if (this.inputSubscription) {
      this.inputSubscription.dispose();
    }
    this.inputSubscription = input.subscribe(this.receive.bind(this));
  }

  receive(input) {
    console.log('bot received input: ', input);
    this.send(new Output({ text: 'this is a test' }));
  }

  send(output) {
    this.output.onNext(output);
  }

}