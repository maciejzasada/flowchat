'use strict';

import config from 'config';

import Flowchat from 'flowchat';

import FacebookInput from './io/facebookInput.js';
import FacebookOutput from './io/facebookOutput.js';
import flows from './flows';

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('messengerAppSecret');

const VERIFY_TOKEN = (process.env.MESSENGER_VERIFY_TOKEN) ?
  (process.env.MESSENGER_VERIFY_TOKEN) :
  config.get('messengerVerifyToken');

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('messengerPageAccessToken');

if (!APP_SECRET || !VERIFY_TOKEN || !PAGE_ACCESS_TOKEN) {
  console.error('Missing config values');
  process.exit(1);
}

const bot = new Flowchat();
const input = new FacebookInput(APP_SECRET, VERIFY_TOKEN);
const output = new FacebookOutput(PAGE_ACCESS_TOKEN);

bot.flows(flows);
bot.setInput(input.subject);
bot.output.subscribe(output.subscribe);

input.listen(process.env.PORT || 5000);