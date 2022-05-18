import {EventEmitter, Injectable} from "@angular/core";
import {MessageDTO} from "../DTOs/chat/MessageDTO";
import {HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel} from "@microsoft/signalr";
import {ApiDomainAddress, ChatAppCookieName, ChatMethodName, invokeSendMessageName} from "../utilities/PathTools";
import {observableToBeFn} from "rxjs/internal/testing/TestScheduler";
import {Observable} from "rxjs";
import {IResponseResult} from "../DTOs/Common/IResponseResult";
import {HttpClient} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageReceived = new EventEmitter<MessageDTO>();
  connectionEstablished = new EventEmitter<Boolean>();
  // @ts-ignore
  private _hubConnection: HubConnection;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  private createConnection() {
    const tokenFromCookie = this.cookieService.get(ChatAppCookieName);
    const options: IHttpConnectionOptions = {
      accessTokenFactory(): string | Promise<string> {
        return tokenFromCookie;
      }
    };

    this._hubConnection = new HubConnectionBuilder()
      .withUrl(ApiDomainAddress + '/chat', options)
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
        console.warn('Error while establishing connection, retying... ' + error);
      });
  }

  registerOnServerEvents(): void {
    this._hubConnection.on(ChatMethodName, (data) => {
      console.log(data);
      this.messageReceived.emit(data);
    });
  }

  sendMessage(message: MessageDTO) {
    console.log(message);
    this._hubConnection.invoke(invokeSendMessageName, message)
      .catch(err => console.error(err));
  }

  getHistoryOfMessages(chatId: number): Observable<IResponseResult<MessageDTO[]>> {
    return this.http.get<IResponseResult<MessageDTO[]>>(`/api/chat/HistoryMessages/${chatId}`)
  }

  stopSignalR(): void {
    this._hubConnection.stop().then(r => console.log());
  }

}

