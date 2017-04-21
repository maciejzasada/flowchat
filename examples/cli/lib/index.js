import { Flowchat, Input } from 'flowchat';
import readline from 'readline';

import router from './routing/basicRouter';
import { helloReducer } from './redux/hello';
import { helloSaga } from './sagas/hello';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const bot = new Flowchat();
const userId = Math.round(Math.random() * 999);

/* Input is an observable that you can rewire and map easily */
bot.setInput(
  bot.input
  .map(text => new Input({ text: text, sessionId: userId }))
  .map(router)
  .concatAll()
);

bot.intent('/hello', helloReducer, helloSaga);

/* The output is an observable. Map it easily and subscribe to it */
bot.output
.map(output => `Bot -> ${output.sessionId}: ${output.text}`)
.subscribe(text => {
  console.log(text);
  rl.prompt();
});

function main() {
  console.log('\n*** Press CRTL+C to end the chat ***\n');
  rl.setPrompt(`${userId}: `);
  rl.prompt();
  rl.on('line', function(line) {
    bot.input.onNext(line);
  });
}

main();