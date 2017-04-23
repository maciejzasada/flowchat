'use strict';

import Test from 'tape';
import { Subject } from 'rx-lite';

import { Flowchat } from '../dist/lib';

Test('test input', (t) => {

    t.test('default input is an Subject', (t) => {
        t.plan(2);
        const bot = new Flowchat();
        const mockInput = { data: Math.random(), state: {}, sessionId: 1 };
        bot.input.subscribe(input => {
            t.ok(true);
            t.deepEqual(mockInput, input);
        });
        bot.input.onNext(mockInput);
    });

    t.test('default input can be overridden with a new Subject', (t) => {
        t.plan(2);
        const bot = new Flowchat();
        const newInput = new Subject();
        const mockInput = { data: Math.random(), state: {}, sessionId: 1 };
        newInput.subscribe(input => {
            t.ok(true);
            t.deepEqual(mockInput, input);
        });
        bot.setInput(newInput);
        bot.input.onNext(mockInput);
    });

    t.test('input requires state and sessionId to be defined', (t) => {
        t.plan(7);
        const bot = new Flowchat();
        const throw1 = () => {
            bot.input.onNext('not an object');
        }
        const throw2 = () => {
            bot.input.onNext({});
        }
        const throw3 = () => {
            bot.input.onNext({ data: 'some data' });
        }
        const throw4 = () => {
            bot.input.onNext({ data: 'some data', state: {} });
        }
        const throw5 = () => {
            bot.input.onNext({ data: 'some data', sessionId: 'abc123' });
        }
        const ok1 = () => {
            bot.input.onNext({ data: 'anything', state: {}, sessionId: 'abc123' });
        }
        const ok2 = () => {
            bot.input.onNext({ data: {more: {complex: 'data'}}, state: {}, sessionId: 123 });
        }
        t.throws(throw1);
        t.throws(throw2);
        t.throws(throw3);
        t.throws(throw4);
        t.throws(throw5);
        t.doesNotThrow(ok1);
        t.doesNotThrow(ok2);
    });

});
