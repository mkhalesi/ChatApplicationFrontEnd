import {environment} from "../../environments/environment";

export const ApiDomainAddress = environment.production ?
  'http://mkhalesi-001-site1.ctempurl.com' :
  'https://localhost:7240';
export const ChatAppCookieName = "ChatAppCookie";
export const ChatMethodName = 'ReceiveMessage';
export const invokeSendMessageName = 'SendMessage';
export const invokeReceiverSeenMessage = "ReceiverSeenMessages";
export const UpdateSenderMessagesReadTime = "UpdateSenderMessagesReadTime";
