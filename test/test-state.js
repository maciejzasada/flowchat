'use strict';

import Test from 'tape';

import { Flowchat } from '../dist/lib';

Test('test state', (t) => {

    t.test('state is a Subject', (t) => {
        t.plan(2);
        const bot = new Flowchat();
        const mockState = {this: {is: 'a test'}};
        bot.state.subscribe(state => {
            t.ok(true);
            t.deepEqual(state, mockState);
        });
        bot.state.onNext(mockState);
    });

});
