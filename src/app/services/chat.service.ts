import {EventEmitter, Injectable} from "@angular/core";
import {MessageDTO} from "../DTOs/chat/MessageDTO";
import {HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel} from "@microsoft/signalr";
import {ApiDomainAddress, ChatAppCookieName, ChatMethodName, invokeSendMessageName} from "../utilities/PathTools";
import {Observable, Subject} from "rxjs";
import {IResponseResult} from "../DTOs/Common/IResponseResult";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {ChatDTO} from "../DTOs/chat/ChatDTO";
import {FilterMessageDTO} from "../DTOs/chat/FilterMessageDTO";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageReceived = new Subject<MessageDTO>();
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

  private registerOnServerEvents(): void {
    this._hubConnection.on(ChatMethodName, (data) => {
      this.messageReceived.next(data);
    });
  }

  sendMessage(message: MessageDTO): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._hubConnection.invoke(invokeSendMessageName, message)
        .catch(err => console.error(err));
      resolve();
    });
  }

  getHistoryOfMessages(filter: FilterMessageDTO): Observable<IResponseResult<FilterMessageDTO>> {
    let params;
    if (filter)
      params = new HttpParams()
        .set('chatId', filter.chatId.toString())
        .set('pageId', filter.pageId.toString())
        .set('takeEntity', filter.takeEntity.toString());
    return this.http.get<IResponseResult<FilterMessageDTO>>(`/api/chat/HistoryMessages`, {params});
  }

  getALlUserChats(): Observable<IResponseResult<ChatDTO[]>> {
    return this.http.get<IResponseResult<ChatDTO[]>>('/api/chat/getAllUserChats');
  }

  getUserChatByChatId(chatId: number): Observable<IResponseResult<ChatDTO>> {
    return this.http.get<IResponseResult<ChatDTO>>(`/api/chat/getUserChatByChatId/${chatId}`);
  }

  callSeenMessages(chatId: number): Observable<IResponseResult<boolean>> {
    return this.http.get<IResponseResult<boolean>>(`/api/chat/SeenMessages/${chatId}`);
  }

  receiverSeenAllMessages(chatId: number): Observable<IResponseResult<boolean>> {
    return this.http.get<IResponseResult<boolean>>(`/api/chat/ReceiverSeenAllMessages/${chatId}`);
  }

  stopSignalR(): void {
    this._hubConnection.stop().then(r => console.log());
  }

}

