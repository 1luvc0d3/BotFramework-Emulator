import { AttachmentContentTypes } from '@bfemulator/sdk-shared';
import OAuthLinkEncoder from './oauthLinkEncoder';
jest.mock('./uniqueId', () => () => 'fgfdsggf5432534');
const mockArgsSentToFetch = [];
let ok = true;
let statusText = '';
let shouldThrow = false;
describe('The OauthLinkEncoder', () => {
  let encoder: OAuthLinkEncoder;
  beforeAll(() => {
    (global as any).fetch = async (...args) => {
      mockArgsSentToFetch.push(args);
      if (shouldThrow) {
        throw new Error("I'm in your throw!");
      }
      return {
        text: async () => 'im in your text!',
        ok,
        statusText,
      };
    };
  });

  beforeEach(() => {
    ok = true;
    statusText = '';
    shouldThrow = false;
    mockArgsSentToFetch.length = 0;
    const emulator = {
      getServiceUrl: async () => 'http://localhost',
      facilities: {
        conversations: {
          conversationById: () => ({
            codeVerifier: '5432654365475677647655676542524352563457',
            botEndpoint: {
              botUrl: 'http://botbot.bot',
            },
            conversationId: 'testConversation',
          }),
        },
      },
    };
    encoder = new OAuthLinkEncoder(
      emulator as any,
      'Bearer 54k52n',
      {
        attachments: [{ contentType: AttachmentContentTypes.oAuthCard }],
        text: 'a message',
      },
      'testConversation'
    );
  });

  it('should resolveOAuthCards as expected with the happy path', async () => {
    const mockActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: {
            buttons: [{ type: 'signin' }],
          },
        },
      ],
      text: 'a message',
    };
    await encoder.resolveOAuthCards(mockActivity);
    expect(mockActivity.attachments[0].content.buttons[0]).toEqual({
      type: 'openUrl',
      value: 'oauthlink://im in your text!&&&testConversation',
    });
  });

  it('should throw when an error occurs retrieving the link while calling resolveOAuthCards', async () => {
    ok = false;
    statusText = 'oh noes!';
    const mockActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: {
            buttons: [{ type: 'signin' }],
          },
        },
      ],
      text: 'a message',
    };
    try {
      await encoder.resolveOAuthCards(mockActivity);
      expect(false);
    } catch (e) {
      expect(e.message).toEqual(statusText);
    }
  });

  it('should throw if fetch throws', async () => {
    shouldThrow = true;
    const mockActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: {
            buttons: [{ type: 'signin' }],
          },
        },
      ],
      text: 'a message',
    };
    try {
      await encoder.resolveOAuthCards(mockActivity);
      expect(false);
    } catch (e) {
      expect(e.message).toEqual("I'm in your throw!");
    }
  });

  it('should generateCodeVerifier as expected', async () => {
    const v = encoder.generateCodeVerifier('testConversation');
    expect(v).toBe('84731c2a08da84c59261d2a79a2b1a0bc6ca70b1d1fc2ce9eb74f4ad979d7dad');
  });
});
