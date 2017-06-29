import Flowchat from 'flowchat';
import readline from 'readline';

import { helloFlow } from './flows/helloFlow';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const bot = new Flowchat();
const userId = Math.round(Math.random() * 999);
const states = {};

bot.flow('/hello', ...helloFlow);

bot.state.subscribe(({ state, sessionId, wait }) => {
  const promise = new Promise(resolve => {
    states[sessionId] = state;
    setTimeout(resolve, 1000);
  });
  wait(promise);
});

bot.output
.subscribe(({ data, sessionId }) => {
  console.log(`Bot -> ${sessionId}: ${data}`);
  rl.prompt();
});

function main() {
  console.log('\n*** Press CRTL+C to end the chat ***\n');
  rl.setPrompt(`${userId}: `);
  rl.prompt();
  rl.on('line', function(line) {
    if (!states[userId]) {
      states[userId] = { saidHello: false };
    }
    bot.input.onNext({ data: line, state: states[userId], sessionId: userId });
  });
}

main();
