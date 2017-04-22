# flowchat

[![Join the chat at https://gitter.im/flowchat/github](https://badges.gitter.im/flowchat/github.svg)](https://gitter.im/flowchat/github?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![npm version](https://img.shields.io/npm/v/flowchat.svg?style=flat-square)](https://www.npmjs.com/package/flowchat)

`flowchat` is a modern ES6 reactive framework for building **scalable**, **maintainable** and **testable** chat bots.

With `flowchat` your chat bot consists of multiple *flows* that are triggered by incoming messages or by other *flows*.

## Flows

Each *flow* determines how the state of the conversation changes and how the bot responds.

A flow consists of three elements:

* `activator` - a promise-based function that determines whether a given flow should run for a given input and a given conversation state.
* `reducer` - a [redux](https://github.com/reactjs/redux) reducer that specifies how the conversation's [Immutable](https://facebook.github.io/immutable-js/) state should change for a given input.
* `saga` - a [redux-saga](https://github.com/redux-saga/redux-saga) that allows running asynchronous code for a given input at ease, including replying to the user or communicating with APIs.

#### `myFlow.js`

```javascript
import { send } from 'flowchat';

const activator = (input, state) => Promise.resolve(input === 'hello');

const reducer = (input, state) => state.set('saidHello', true);

function* saga (input, state, sessionId) {
  yield send('Hello, user!', state, sessionId);
}

export const myFlow = [activator, reducer, saga];
```

## I/O

`flowchat` provides [Observable](http://reactivex.io/documentation/observable.html) `input` and `output`, making no assumptions on where the conversation input comes from and where the output should go. Using [Observables](http://reactivex.io/documentation/observable.html) for input and output also allows for their easy and modular mapping.

#### `app.js`

```javascript
import { Flowchat, Input } from 'flowchat';

const bot = new Flowchat();

bot.setInput(
  bot.input
  .map(text => new Input({ text, sessionId: userId }))
);

bot.output
.map(output => `Bot -> ${output.sessionId}: ${output.text}`)
.subscribe(text => {
  console.log(text);
});

bot.input.onNext('Hello, chat bot!');
```

# Getting started

## Install

```sh
$ npm install --save flowchat
```
or

```sh
$ yarn add flowchat
```

## Usage Example

Suppose you want to create a chat bot that ...
TODO

#### `bot.js`

```javascript
// TODO
```
