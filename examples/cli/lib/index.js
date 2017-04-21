import { Flowchat, Input } from 'flowchat';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const bot = new Flowchat();

/* Input is an observable that you can rewire and map easily */
bot.setInput(
  bot.input
  .map(text => new Input({ text: text }))
);

// bot.flow('/hello', (input) => {

// });

/* The output is an observable. Map it easily and subscribe to it */
bot.output
.map(output => output.text)
.subscribe(text => {
  console.log(`Bot: ${text}`);
  rl.prompt();
});

function main() {
  console.log('\n*** Press CRTL+C to end the chat ***\n');
  rl.setPrompt('you: ');
  rl.prompt();
  rl.on('line', function(line) {
    bot.input.onNext(line);
  });
}

main();