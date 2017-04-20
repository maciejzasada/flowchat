import { Flowchat, Input } from 'flowchat';
import readline from 'readline';

const bot = new Flowchat();

/* Add middlewares that process the input */
bot.use((consoleInput, sessionId, extra) => {
  return Promise.resolve(new Input({ text: consoleInput }));
});

/* Do what you want with the output */
bot.output.subscribe(output => {
  console.log(`Bot: ${output.text}`);
});

function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n*** Press CRTL+C to end the chat ***\n');
  rl.setPrompt('you: ');
  rl.prompt();
  rl.on('line', function(line) {
    bot.input(line)
      .then(() => {
        rl.prompt();
      });
  });
}

main();