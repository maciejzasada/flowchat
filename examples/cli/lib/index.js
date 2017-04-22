import { Flowchat } from 'flowchat';
import readline from 'readline';

import { helloFlow } from './flows/helloFlow';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const bot = new Flowchat();
const userId = Math.round(Math.random() * 999);

bot.flow('/hello', ...helloFlow);

bot.output
.subscribe(({ data, state, sessionId }) => {
  console.log(`Bot -> ${sessionId}: ${data}`, state);
  rl.prompt();
});

function main() {
  console.log('\n*** Press CRTL+C to end the chat ***\n');
  rl.setPrompt(`${userId}: `);
  rl.prompt();
  rl.on('line', function(line) {
    bot.input.onNext({ data: line, state: {}, sessionId: userId });
  });
}

main();
