'use strict';

import Test from 'tape';

import { Flowchat, send } from '../dist/lib';

Test('test output', (t) => {

    t.test('send effect sends output', (t) => {
        t.plan(2);
        const bot = new Flowchat();
        const mockOutput = {this: {is: 'a test'}};
        const mockSessionId = Math.random();
        const activator = () => true;
        const reducer = (input, state) => state;
        const saga = function* (input, state, sessionId) {
            yield send(mockOutput, sessionId);
        }
        const flow = [activator, reducer, saga];
        bot.flow('/test', ...flow);
        bot.output.subscribe(({ data, sessionId }) => {
            t.deepEqual(data, mockOutput);
            t.equal(sessionId, mockSessionId);
        });
        bot.input.onNext({ data: 'test', state: {}, sessionId: mockSessionId });
    });

});
