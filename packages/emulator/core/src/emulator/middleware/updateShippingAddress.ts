//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as HttpStatus from 'http-status-codes';
import * as Restify from 'restify';

import Bot from '../../bot';
import ICheckoutConversationSession from '../../types/payment/checkoutConversationSession';
import IPaymentAddress from '../../types/payment/address';
import IPaymentRequest from '../../types/payment/request';
import sendErrorResponse from '../../utils/sendErrorResponse';

export default function updateShippingAddress(bot: Bot) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    try {
      const body: {
        checkoutSession: ICheckoutConversationSession,
        request: IPaymentRequest,
        shippingAddress: IPaymentAddress,
        shippingOptionId: string
      } = req.body[0];

      req['conversation'].sendUpdateShippingAddressOperation(body.checkoutSession, body.request, body.shippingAddress, body.shippingOptionId, async (statusCode, resp) => {
        if (statusCode === HttpStatus.OK) {
          res.send(HttpStatus.OK, await resp.json());
        } else {
          res.send(statusCode);
        }

        res.end();
      });
    } catch (err) {
      sendErrorResponse(req, res, next, err);
    }
  };
}