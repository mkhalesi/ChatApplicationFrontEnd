import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {MessageDTO} from "../../DTOs/chat/MessageDTO";
import {Router} from "@angular/router";
import {ChatService} from "../../services/chat.service";
import {AuthService} from "../../services/auth.service";
import {takeUntil} from "rxjs/operators";
import {Subject, Subscription} from "rxjs";
import {CurrentUser} from "../../DTOs/User/CurrentUser";
import {ChatDTO} from "../../DTOs/chat/ChatDTO";
import {FilterMessageDTO} from "../../DTOs/chat/FilterMessageDTO";

declare function chatScriptFunction(): any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  @ViewChild('endOfUserChat') private userChatListContainer: ElementRef | undefined;

  chatMessageLoading = false;
  currentUser: CurrentUser | null = null;
  filterMessages: FilterMessageDTO = new FilterMessageDTO(0, []);
  messages: MessageDTO[] = [];
  message: MessageDTO | null = null;
  pages: number[] = [];
  pageId = 1;
  allUserChats: ChatDTO[] = [];
  selectedChat: ChatDTO | null = null;
  selectedChatId = 0;
  txtMessage = "";
  messageReceiveSubscription: Subscription = new Subscription();
  scrollToBottomChatMessages = true;
  private destroyed: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.filterMessages.takeEntity = 15;
    chatScriptFunction();
    this.authService.getCurrentUser().subscribe(res => {
        this.authService.isAuthenticated().then(auth => {
          if (!auth)
            this.router.navigate(['/login']);
        })
        this.currentUser = res;
      }
    )
    this.subscribeToEvents();
    this.chatService.getALlUserChats().subscribe(chatsRes => {
      if (chatsRes.success && chatsRes.data && chatsRes.data.length > 0) {
        this.allUserChats = chatsRes.data;
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private subscribeToEvents(): void {
    this.messageReceiveSubscription = this.chatService.messageReceived
      .pipe(takeUntil(this.destroyed))
      .subscribe((message: MessageDTO) => {
        if (message) {
          this.ngZone.run(() => {
            this.messages.push(message);
          });
        }
      });
  }

  sendToMessage(): void {
    if (this.txtMessage && this.currentUser && this.selectedChat) {
      this.message = new MessageDTO(0, 0, 0, 0, false, '', '', '', 0, 0);
      this.message.receiverId = this.selectedChat?.receiverId;
      this.message.chatId = this.selectedChat.chatId;
      this.message.message = this.txtMessage;
      this.chatService.sendMessage(this.message);
      this.txtMessage = '';
      this.scrollToBottomChatMessages = true;
      this.scrollToBottom();
    }
  }

  textMessageChange(event: any): void {
    this.txtMessage = event.target.value;
  }

  selectChat(selectedChatId: number): void {
    this.chatService.getUserChatByChatId(selectedChatId).subscribe(chatRes => {
        if (chatRes.success && chatRes.data) {
          this.selectedChat = chatRes.data;
          this.selectedChatId = selectedChatId;
          this.filterMessages = new FilterMessageDTO(this.selectedChatId, []);
          this.messages = [];
          this.filterMessages.chatId = selectedChatId;
          this.scrollToBottomChatMessages = true;
          this.getUserHistoryMessages().then(() => {
          });
        }
      }
    )
  }

  getUserHistoryMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.filterMessages.pageId <= this.filterMessages.endPage || this.filterMessages.pageId === 1) {
        this.pages = [];
        this.chatService.getHistoryOfMessages(this.filterMessages).pipe(takeUntil(this.destroyed))
          .subscribe(result => {
            if (result.success) {
              this.filterMessages.pageId = this.pageId;
              this.filterMessages = result.data;
              if (this.messages && this.messages.length > 0) {
                this.messages.reverse();
                this.messages.push(...result.data.messages);
                this.messages.reverse();
              } else {
                this.messages.push(...result.data.messages);
              }
              for (let i = this.filterMessages.startPage; i <= this.filterMessages.endPage; i++) {
                this.pages.push(i);
              }
              resolve();
            }
          }, error => console.log(error));
      }
    })
  }

  loadData() {
    this.chatMessageLoading = true;
    this.filterMessages.pageId += 1;
    this.scrollToBottomChatMessages = false;
    this.getUserHistoryMessages().then(() => {
      this.chatMessageLoading = false;
    });
  }

  scrollToBottom(): void {
    try {
      const scrollHeight = this.userChatListContainer?.nativeElement.scrollHeight - 30;
      if (this.userChatListContainer?.nativeElement.scrollTop === 0 || this.scrollToBottomChatMessages) {
        // @ts-ignore
        this.userChatListContainer?.nativeElement.scrollTop = scrollHeight;
      }
    } catch (err) {
    }
  }

  ngOnDestroy(): void {
    this.messageReceiveSubscription?.unsubscribe();
    this.destroyed?.next();
    this.destroyed?.complete();
    this.chatService.stopSignalR();
  }

}
