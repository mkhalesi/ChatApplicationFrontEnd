import {EventEmitter, Injectable} from "@angular/core";
import {MessageDTO} from "../DTOs/chat/MessageDTO";
import {HubConnection, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {ApiDomainAddress, ChatMethodName, invokeSendMessageName} from "../utilities/PathTools";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageReceived = new EventEmitter<MessageDTO>();
  connectionEstablished = new EventEmitter<Boolean>();
  // @ts-ignore
  private _hubConnection: HubConnection;

  constructor() {
  }

  private createConnection() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(ApiDomainAddress + '/chat')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
  }

  private startConnection(): void {
    this._hubConnection.start()
      .then(() => {
        this.connectionEstablished.emit(true);
        console.log('Hub Connection started');
      })
      .catch(error => {
        console.log('Error while establishing connection, retying... ');
      });
  }

  registerOnServerEvents(): void {
    this._hubConnection.on(ChatMethodName, (data) => {
      this.messageReceived.emit(data);
    });
  }

  sendMessage(message: MessageDTO) {
    this._hubConnection.invoke(invokeSendMessageName, message)
      .catch(err => console.log(err));
  }

  stopSignalR(): void {
    this._hubConnection.stop();
  }
}

