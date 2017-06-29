'use strict';

import request from 'request';

export default class FacebookOutput {

  static API_URI = 'https://graph.facebook.com/v2.6/me/messages';

  constructor(pageAccessToken) {
    this.pageAccessToken = pageAccessToken;
    this.subscribe = this._subscribe.bind(this);
  }

  _subscribe(output) {
    this._send(output.data, output.sessionId);
  }

  _send(data, recipientId) {
    this._callSendAPI({
      recipient: {
        id: recipientId
      },
      message: data
    });
  }

  _callSendAPI(messageData) {
    request({
      uri: FacebookOutput.API_URI,
      qs: { access_token: this.pageAccessToken },
      method: 'POST',
      json: messageData
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        console.error('Failed calling Send API', response.statusCode, response.statusMessage,
          body.error);
      }
    });
  }

}
