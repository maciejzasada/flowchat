'use strict';

import Test from 'tape';

import { Flowchat, input as inputEffect } from '../dist/lib';

Test('test input effect', (t) => {

    t.test('input effect emulates new chat bot input', (t) => {
        t.plan(1);
        const bot = new Flowchat();

        const activator1 = (input) => input === 'one';
        const reducer1 = (input, state) => state;
        const saga1 = function* (input, state, sessionId) {
            yield inputEffect('two', state, sessionId);
        }
        const flow1 = [activator1, reducer1, saga1];
        bot.flow('/one', ...flow1);

        const activator2 = (input) => input === 'two';
        const reducer2 = (input, state) => state;
        const saga2 = function* () {
            t.ok(true);
        }
        const flow2 = [activator2, reducer2, saga2];
        bot.flow('/two', ...flow2);

        bot.input.onNext({ data: 'one', state: {}, sessionId: 1 });
    });

});
