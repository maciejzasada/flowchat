import { Subject } from 'rx-lite';

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
    this.send('this is a test');
  }

  send(output) {
    this.output.onNext(output);
  }

}