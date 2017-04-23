'use strict';

import Test from 'tape';

import { Flowchat } from '../dist/lib';

Test('test activator', (t) => {

    t.test('activator receives input, state and sessionId', (t) => {
        t.plan(3);
        const mockInput = Math.random();
        const mockState = {rand: Math.random()};
        const mockSessionId = Math.random();
        const activator = (input, state, sessionId) => {
            t.equal(mockInput, input);
            t.deepEqual(mockState, state);
            t.equal(mockSessionId, sessionId);
        }
        const reducer = (input, state) => state;
        const saga = function* () {};
        const flow = [activator, reducer, saga];
        const bot = new Flowchat();
        bot.flow('/test', ...flow);
        bot.input.onNext({ data: mockInput, state: mockState, sessionId: mockSessionId });
    });

    t.test('send, input and run are restricted flow names', (t) => {
        t.plan(3);
        const bot = new Flowchat();
        const activator = () => true;
        const reducer = (input, state) => state;
        const saga = function* () {};
        const mockFlow = [activator, reducer, saga];
        const throw1 = () => bot.flow('send', ...mockFlow);
        const throw2 = () => bot.flow('input', ...mockFlow);
        const throw3 = () => bot.flow('run', ...mockFlow);
        t.throws(throw1);
        t.throws(throw2);
        t.throws(throw3);
    });

    t.test('flows run when activator returns true', (t) => {
        t.plan(1);
        const bot = new Flowchat();
        const activator = () => true;
        const reducer = (input, state) => state;
        const saga = function* () {
            t.ok(true);
        };
        const flow = [activator, reducer, saga];
        bot.flow('/test', ...flow);
        bot.input.onNext({ data: 'test', state: {}, sessionId: 1 });
    });

    t.test('flows do not run when activator returns false', (t) => {
        t.plan(1);
        const bot = new Flowchat();
        const activator = () => false;
        const reducer = (input, state) => state;
        const saga = function* () {
            t.ok(false);
        };
        const flow = [activator, reducer, saga];
        bot.flow('/test', ...flow);
        bot.input.onNext({ data: 'test', state: {}, sessionId: 1 });
        setTimeout(() => {
            t.ok(true);
        }, 10);
    });

    t.test('flows run when activator returns a promise that resolves to true', (t) => {
        t.plan(1);
        const bot = new Flowchat();
        const activator = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(true);
                }, 10);
            });
        }
        const reducer = (input, state) => state;
        const saga = function* () {
            t.ok(true);
        };
        const flow = [activator, reducer, saga];
        bot.flow('/test', ...flow);
        bot.input.onNext({ data: 'test', state: {}, sessionId: 1 });
    });

    t.test('flows do not run when activator returns a promise that resolves to false', (t) => {
        t.plan(1);
        const bot = new Flowchat();
        const activator = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(false);
                }, 10);
            });
        }
        const reducer = (input, state) => state;
        const saga = function* () {
            t.ok(false);
        };
        const flow = [activator, reducer, saga];
        bot.flow('/test', ...flow);
        bot.input.onNext({ data: 'test', state: {}, sessionId: 1 });
        setTimeout(() => {
            t.ok(true);
        }, 20);
    });

});
