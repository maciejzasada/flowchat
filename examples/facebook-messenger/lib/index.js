'use strict';

const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  request = require('request');

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('messengerAppSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VERIFY_TOKEN) ?
  (process.env.MESSENGER_VERIFY_TOKEN) :
  config.get('messengerVerifyToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('messengerPageAccessToken');

if (!APP_SECRET || !VALIDATION_TOKEN || !PAGE_ACCESS_TOKEN) {
  console.error('Missing config values');
  process.exit(1);
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers['x-hub-signature'];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    throw new Error('Could not validate signature');
  } else {
    const elements = signature.split('=');
    const signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex');

    if (signatureHash !== expectedHash) {
      throw new Error('Couldn\'t validate the request signature.');
    }
  }
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      if (messageId) {
        console.log('Successfully sent message with id %s to recipient %s', messageId, recipientId);
      } else {
        console.log('Successfully called Send API for recipient %s', recipientId);
      }
    } else {
      console.error('Failed calling Send API', response.statusCode, response.statusMessage,
        body.error);
    }
  });  
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: 'DEVELOPER_DEFINED_METADATA'
    }
  };

  callSendAPI(messageData);
}

function receive(event) {
  const senderID = event.sender.id;
  const jsonStr = JSON.stringify(event);
  sendTextMessage(senderID, `Echo: ${jsonStr}`);
}

const app = express();
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({ verify: verifyRequestSignature }));

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach((pageEntry) => {
      const pageID = pageEntry.id;
      const timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach((messagingEvent) => {
        receive(messagingEvent);
        // if (messagingEvent.optin) {
        //   receivedAuthentication(messagingEvent);
        // } else if (messagingEvent.message) {
        //   receivedMessage(messagingEvent);
        // } else if (messagingEvent.delivery) {
        //   receivedDeliveryConfirmation(messagingEvent);
        // } else if (messagingEvent.postback) {
        //   receivedPostback(messagingEvent);
        // } else if (messagingEvent.read) {
        //   receivedMessageRead(messagingEvent);
        // } else if (messagingEvent.account_linking) {
        //   receivedAccountLink(messagingEvent);
        // } else {
        //   console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        // }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

// Start the server
app.listen(app.get('port'), () => {
  console.log(`App listening on port ${app.get('port')}`);
  console.log('Press Ctrl+C to quit.');
});
