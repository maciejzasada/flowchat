'use strict';

import Test from 'tape';

import { Flowchat, run } from '../dist/lib';

Test('test run effect', (t) => {

    t.test('run effect unconditionally runs another flow, skipping the activator', (t) => {
        t.plan(2);
        const bot = new Flowchat();
        let reducer2Run = false;

        const activator1 = (input) => input === 'one';
        const reducer1 = (input, state) => state;
        const saga1 = function* (input, state, sessionId) {
            yield run('/two', 'test', state, sessionId);
        }
        const flow1 = [activator1, reducer1, saga1];
        bot.flow('/one', ...flow1);

        const activator2 = () => {
          t.ok(!reducer2Run);  // this activator should only be run once, at the initial input
          reducer2Run = true;
          return false;
        }
        const reducer2 = (input, state) => state;
        const saga2 = function* () {
            t.ok(true);
        }
        const flow2 = [activator2, reducer2, saga2];
        bot.flow('/two', ...flow2);

        bot.input.onNext({ data: 'one', state: {}, sessionId: 1 });
    });

});
