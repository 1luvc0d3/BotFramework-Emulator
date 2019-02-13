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

import { GenericActivity, ILogItem } from '@bfemulator/sdk-shared';

import { BotEmulator } from './botEmulator';
import ConsoleLogService from './facility/consoleLogService';

const mockRegisterAttachmentRoutes = jest.fn((..._args) => null);
jest.mock('./attachments/registerRoutes', () => ({ default: mockRegisterAttachmentRoutes }));

const mockRegisterBotStateRoutes = jest.fn((..._args) => null);
jest.mock('./botState/registerRoutes', () => ({ default: mockRegisterBotStateRoutes }));

const mockRegisterConversationRoutes = jest.fn((..._args) => null);
jest.mock('./conversations/registerRoutes', () => ({ default: mockRegisterConversationRoutes }));

const mockRegisterDirectLineRoutes = jest.fn((..._args) => null);
jest.mock('./directLine/registerRoutes', () => ({ default: mockRegisterDirectLineRoutes }));

const mockRegisterEmulatorRoutes = jest.fn((..._args) => null);
jest.mock('./emulator/registerRoutes', () => ({ default: mockRegisterEmulatorRoutes }));

const mockRegisterSessionRoutes = jest.fn((..._args) => null);
jest.mock('./session/registerRoutes', () => ({ default: mockRegisterSessionRoutes }));

const mockRegisterUserTokenRoutes = jest.fn((..._args) => null);
jest.mock('./userToken/registerRoutes', () => ({ default: mockRegisterUserTokenRoutes }));

const mockAcceptParser = jest.fn(_acceptable => null);
const mockDateParser = jest.fn(() => null);
const mockQueryParser = jest.fn(() => null);
jest.mock('restify', () => ({
  plugins: {
    acceptParser: mockAcceptParser,
    dateParser: mockDateParser,
    queryParser: mockQueryParser,
  },
}));

describe('BotEmulator', () => {
  it('should instantiate itself properly', async () => {
    const getServiceUrl = url => Promise.resolve('serviceUrl');
    const customFetch = (url, options) => Promise.resolve();
    const customLogger = {
      logActivity: (_conversationId: string, _activity: GenericActivity, _role: string) => 'activityLogged',
      logMessage: (_conversationId: string, ..._items: ILogItem[]) => 'messageLogged',
      logException: (_conversationId: string, _err: Error) => 'exceptionLogged',
    };
    const customLogService = new ConsoleLogService();

    // with logger
    const options1 = {
      fetch: customFetch,
      loggerOrLogService: customLogger,
    };
    const botEmulator1 = new BotEmulator(getServiceUrl, options1);
    const serviceUrl = await botEmulator1.getServiceUrl('');

    expect(serviceUrl).toBe('serviceUrl');
    expect(botEmulator1.options).toEqual({ ...options1, stateSizeLimitKB: 64 });
    expect(botEmulator1.facilities.attachments).not.toBeFalsy();
    expect(botEmulator1.facilities.botState).not.toBeFalsy();
    expect(botEmulator1.facilities.conversations).not.toBeFalsy();
    expect(botEmulator1.facilities.endpoints).not.toBeFalsy();
    expect(botEmulator1.facilities.logger).not.toBeFalsy();
    expect(botEmulator1.facilities.users).not.toBeFalsy();
    expect(botEmulator1.facilities.botState.stateSizeLimitKB).toBe(64);
    expect(await botEmulator1.facilities.logger.logActivity('', null, '')).toBe('activityLogged');
    expect(await botEmulator1.facilities.logger.logException('', null)).toBe('exceptionLogged');
    expect(await botEmulator1.facilities.logger.logMessage('')).toBe('messageLogged');

    // with log service
    const options2 = {
      fetch: customFetch,
      loggerOrLogService: customLogService,
    };
    const botEmulator2 = new BotEmulator(getServiceUrl, options2);

    expect((botEmulator2.facilities.logger as any).logService).toEqual(customLogService);
  });

  it('should mount routes onto a restify server', () => {});
});
