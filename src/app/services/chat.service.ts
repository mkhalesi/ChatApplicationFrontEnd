import {EventEmitter, Injectable} from "@angular/core";
import {MessageDTO} from "../DTOs/chat/MessageDTO";
import {HubConnection, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {ApiDomainAddress, ChatMethodName, invokeSendMessageName} from "../utilities/PathTools";
import {observableToBeFn} from "rxjs/internal/testing/TestScheduler";
import {Observable} from "rxjs";
import {IResponseResult} from "../DTOs/Common/IResponseResult";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageReceived = new EventEmitter<MessageDTO>();
  connectionEstablished = new EventEmitter<Boolean>();
  // @ts-ignore
  private _hubConnection: HubConnection;

  constructor(
    private http: HttpClient
  ) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
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

  getHistoryOfMessages(chatId: number): Observable<IResponseResult<MessageDTO[]>> {
    return this.http.get<IResponseResult<MessageDTO[]>>(`/api/chat/HistoryMessages/${chatId}`)
  }

  stopSignalR(): void {
    this._hubConnection.stop().then(r => console.log());
  }

}

