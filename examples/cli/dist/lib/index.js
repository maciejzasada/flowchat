'use strict';

var _flowchat = require('flowchat');

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _helloFlow = require('./flows/helloFlow');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rl = _readline2.default.createInterface({ input: process.stdin, output: process.stdout });
const bot = new _flowchat.Flowchat();
const userId = Math.round(Math.random() * 999);

bot.flow('/hello', ..._helloFlow.helloFlow);

bot.output.subscribe(({ data, state, sessionId }) => {
  console.log(`Bot -> ${sessionId}: ${data}`, state);
  rl.prompt();
});

function main() {
  console.log('\n*** Press CRTL+C to end the chat ***\n');
  rl.setPrompt(`${userId}: `);
  rl.prompt();
  rl.on('line', function (line) {
    bot.input.onNext({ data: line, state: {}, sessionId: userId });
  });
}

main();