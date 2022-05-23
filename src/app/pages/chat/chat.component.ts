import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MessageDTO} from "../../DTOs/chat/MessageDTO";
import {Router} from "@angular/router";
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../services/auth.service";
import {takeUntil} from "rxjs/operators";
import {Subject, Subscription} from "rxjs";
import {CurrentUser} from "../../DTOs/User/CurrentUser";
import {ChatDTO} from "../../DTOs/chat/ChatDTO";

declare function chatScriptFunction(): any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  currentUser: CurrentUser | null = null;
  txtMessage = "";
  activeChat: ChatDTO | null = null;
  messages: MessageDTO[] = [];
  message: MessageDTO | null = null;
  history: MessageDTO[] = [];
  allUserChats: ChatDTO[] = [];
  selectedChat: ChatDTO | null = null;
  messageReceiveSubscription: Subscription = new Subscription();
  private destroyed: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    chatScriptFunction();
    this.authService.getCurrentUser().subscribe(res => {
        this.authService.isAuthenticated().then(auth => {
          if (!auth)
            this.router.navigate(['/login']);
        })
        this.currentUser = res;
        this.subscribeToEvents();

        this.chatService.getALlUserChats().subscribe(chatsRes => {
          if (chatsRes.success && chatsRes.data && chatsRes.data.length > 0) {
            this.allUserChats = chatsRes.data;
          }
        });

      }
    )
  }

  private subscribeToEvents(): void {
    console.warn('called');
    this.messageReceiveSubscription = this.chatService.messageReceived
      .subscribe((message: MessageDTO) => {
        console.warn('called');
        if (message) {
          this.ngZone.run(() => {
            this.messages.push(message);
          });
        }
      });
  }

  sendToMessage(): void {
    if (this.txtMessage && this.currentUser) {
      this.message = new MessageDTO(0, 0, 0, 0, false, '', '', '', 0, 0);
      /*this.message.receiverId = this.currentUser.id;*/
      this.message.message = this.txtMessage;
      this.chatService.sendMessage(this.message);
      this.txtMessage = '';
    }
  }

  textMessageChange(event: any): void {
    this.txtMessage = event.target.value;
  }

  selectChat(selectedChatId: number): void {
    this.chatService.getUserChatByChatId(selectedChatId).subscribe(res => {
        if (res.success && res.data) {
          this.selectedChat = res.data;

          this.chatService.getHistoryOfMessages(selectedChatId).pipe(takeUntil(this.destroyed))
            .subscribe(result => {
              if (result.success) {
                this.history = result.data;
                if (this.history && this.history.length > 0) {
                  this.history.forEach(item => this.messages.push(item))
                }
              }
            }, error => console.log(error));
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.messageReceiveSubscription?.unsubscribe();
    this.destroyed?.next();
    this.destroyed?.complete();
    this.chatService.stopSignalR();
  }

}
