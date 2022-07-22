import {Component, OnDestroy, OnInit} from '@angular/core';
import {CurrentUser} from "./DTOs/User/CurrentUser";
import {AuthService} from "./services/auth.service";
import {Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {ChatAppCookieName} from "./utilities/PathTools";
import {ChatService} from "./services/chat.service";
import {Subject, Subscription} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {MessageDTO} from "./DTOs/chat/MessageDTO";
import {GlobalEventManager} from "./utilities/GlobalEventManager";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ChatAppSignalRFrontEnd';
  messageReceiveSubscription: Subscription = new Subscription();
  currentUser: CurrentUser | null = null;
  private destroyed: Subject<void> = new Subject<void>();
  selectedChatId = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private chatService: ChatService,
    private eventManager: GlobalEventManager
  ) {
    this.eventManager.selectedChatIdEvent.subscribe(chatId => {
      this.selectedChatId = chatId;
    });
  }

  ngOnInit(): void {
    this.authService.checkUserAuth().subscribe(res => {
      if (res.success) {
        this.currentUser = new CurrentUser(
          res.data.id,
          res.data.firstName,
          res.data.lastName,
          res.data.email,
          res.data.isConfirmed,
        );
        this.authService.setCurrentUser(this.currentUser);
        this.subscribeToEvents();
      }
    }, error => {
      this.cookieService.delete(ChatAppCookieName);
      this.router.navigate(['/login']);
    })
  }

  private subscribeToEvents(): void {
    this.messageReceiveSubscription = this.chatService.messageReceived
      .pipe(takeUntil(this.destroyed))
      .subscribe((message: MessageDTO) => {
        if (this.selectedChatId !== message.chatId) {
          if (message.receiverId === this.currentUser?.id) {
            this.requestPermissionForNotification(message);
          }
        }
      });
  }

  requestPermissionForNotification(newMessage: MessageDTO) {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(r => {
        if (r === "granted") {
          this.sendNotificationToReceiver(newMessage);
        }
      });
    } else {
      this.sendNotificationToReceiver(newMessage);
    }
  }

  sendNotificationToReceiver(newMessage: MessageDTO | null) {
    if (newMessage?.receiverId == this.currentUser?.id) {
      const notification = new Notification('New Message in ChatApp', {
        body: 'new Message from ' + newMessage?.senderFullName,
      });
      notification.onclick = () => {
        window.open(`/chat/${newMessage?.chatId}`);
      }
    }
  }

  ngOnDestroy(): void {
    this.messageReceiveSubscription?.unsubscribe();
    this.destroyed?.next();
    this.destroyed?.complete();
    this.chatService.stopSignalR();
  }

}
