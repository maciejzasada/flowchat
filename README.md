# flowchat

[![Join the chat at https://gitter.im/flowchat/github](https://badges.gitter.im/flowchat/github.svg)](https://gitter.im/flowchat/github?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://img.shields.io/npm/v/flowchat.svg?style=flat-square)](https://www.npmjs.com/package/flowchat)
[![Build Status](https://travis-ci.org/maciejzasada/flowchat.svg?branch=develop)](https://travis-ci.org/maciejzasada/flowchat)
[![Coverage Status](https://coveralls.io/repos/github/maciejzasada/flowchat/badge.svg?branch=develop)](https://coveralls.io/github/maciejzasada/flowchat?branch=develop)

`flowchat` is a modern ES6 reactive framework for building **scalable**, **maintainable** and **testable** chat bots.

With `flowchat` your chat bot consists of multiple *flows* that are triggered by incoming messages or by other *flows*.

## Flows

Each *flow* determines how the state of the conversation changes and how the bot responds.

A flow consists of three elements:

* `activator` - a function that determines whether the flow should run for a given input and conversation state. Synchronous or [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)-based.
* `reducer` - a [redux](https://github.com/reactjs/redux) reducer that specifies how the conversation state should change for a given input.
* `saga` - a [redux-saga](https://github.com/redux-saga/redux-saga) that allows running asynchronous code for a given input at ease, including replying to the user or communicating with APIs.

## I/O

`flowchat` provides [Subject](http://reactivex.io/documentation/subject.html) `input`, `output` and `state`, making no assumptions on where the conversation input comes from and where the output should go, as well as how you persist the conversation state. Using [Subject](http://reactivex.io/documentation/subject.html) for input and output also allows for their easy and modular mapping.

## The Gist

#### `helloFlow.js`

```javascript
import { send } from 'flowchat';

const activator = (input, state) => input === 'hello';

const reducer = (input, state) => Object.assign({}, state, { saidHello: true });

function* saga (input, state, sessionId) {
  yield send('Hello, user!', state, sessionId);
}

export const helloFlow = [activator, reducer, saga];
```

#### `app.js`

```javascript
import { Flowchat } from 'flowchat';

import { helloFlow } from './helloFlow';

const bot = new Flowchat();
let sessionId = Math.random();

bot.flow('/hello', ...helloFlow);

bot.state.subscribe(newState => console.log('state:', newState));
bot.output.subscribe(({ data, sessionId }) => console.log('data:', data));

bot.input.onNext({ data: 'hello', state: { saidHello: false }, sessionId });
// logs "state: { saidHello: true }"
// logs "Hello, user!"

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

# Documentation

## Basics concepts

* Getting started
* Session
* Persistence
* Creating a Facebook Messenger chat bot

## Advanced topics

* Plugging AI
* Creating a middleware
* Using with Immutable.js

## API Reference

* [API reference](docs/API.md)
