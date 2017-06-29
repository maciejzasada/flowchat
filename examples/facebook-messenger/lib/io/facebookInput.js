'use strict';

import bodyParser from 'body-parser';
import crypto from 'crypto';
import express from 'express';
import { Subject } from 'rx-lite';

export default class FacebookInput {

  constructor(appSecret, verifyToken) {
    this.appSecret = appSecret;
    this.verifyToken = verifyToken;

    this._subject = new Subject();
    this._app = express();
    this._app.use(bodyParser.json({ verify: this.verifyRequestSignature.bind(this) }));

    this._app.get('/', (req, res) => {
      res.status(200).send('Hello, world!').end();
    });

    this._app.get('/webhook', this.getWebhook.bind(this));
    this._app.post('/webhook', this.postWebhook.bind(this));
  }

  get subject() {
    return this._subject;
  }

  listen(port) {
    this._app.listen(port, () => {
      console.log(`Facebook input listening on port ${port} at /webhook`);
      console.log('Press Ctrl+C to quit.');
    });
  }

  verifyRequestSignature(req, res, buf) {
    var signature = req.headers['x-hub-signature'];

    if (!signature) {
      throw new Error('Could not validate signature');
    } else {
      const elements = signature.split('=');
      const signatureHash = elements[1];

      var expectedHash = crypto.createHmac('sha1', this.appSecret).update(buf).digest('hex');

      if (signatureHash !== expectedHash) {
        throw new Error('Could not validate the request signature.');
      }
    }
  }

  getWebhook(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === this.verifyToken) {
      console.log('Validating webhook');
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error('Failed validation. Make sure the verify tokens match.');
      res.sendStatus(403);
    }
  }

  postWebhook(req, res) {
    const data = req.body;

    if (data.object === 'page') {
      data.entry.forEach(pageEntry => {
        const pageID = pageEntry.id;
        const timeOfEvent = pageEntry.time;

        pageEntry.messaging.forEach(messagingEvent => {
          this.receive(messagingEvent);
        });
      });

      res.sendStatus(200);
    }
  }

  receive(event) {
    const eventCopy = Object.assign({}, event);
    const data = eventCopy.message;
    const state = {};
    const sessionId = event.sender.id;
    
    delete(eventCopy.message);
    data.event = eventCopy;
    eventCopy.mid = data.mid;
    eventCopy.seq = data.seq;
    delete(data.mid);
    delete(data.seq);

    this.subject.onNext({ data, state, sessionId });
  }
}