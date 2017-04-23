'use strict';

import Test from 'tape';

import { Flowchat } from '../dist/lib';

Test('test reducer', (t) => {

    t.test('reducer updates the state', (t) => {
        t.plan(1);
        let sessionState = { counter: 0 };
        const activator = () => true;
        const reducer = (input, state) => Object.assign({}, state, {counter: state.counter + 1});
        const saga = function* () {};
        const flow = [activator, reducer, saga];
        const bot = new Flowchat();
        bot.flow('/test', ...flow);
        bot.state.subscribe(state => {
            sessionState = state;
        });
        const sendInput = () => {
            bot.input.onNext({ data: 'test', state: sessionState, sessionId: 1 });
        }
        setTimeout(sendInput, 0);
        setTimeout(sendInput, 10);
        setTimeout(sendInput, 20);
        setTimeout(() => {
            t.equal(sessionState.counter, 3);
        }, 30);
    });

});
