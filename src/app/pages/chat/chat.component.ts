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
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CookieService} from "ngx-cookie-service";
import {ChatAppCookieName} from "../../utilities/PathTools";

declare function chatScriptFunction(): any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  @ViewChild('endOfUserChat') private userChatListContainer: ElementRef | undefined;

  chatLoading = true;
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
  messageForm: FormGroup | null = null;
  messageReceiveSubscription: Subscription = new Subscription();
  scrollToBottomChatMessages = true;
  currentScrollHeight = 0;
  private destroyed: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private ngZone: NgZone,
    private cookieService: CookieService,
  ) {
  }

  ngOnInit(): void {
    this.filterMessages.takeEntity = 15;
    chatScriptFunction();
    this.messageForm = new FormGroup({
      message: new FormControl(null, [
        Validators.required,
      ])
    })
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
    if (this.messageForm && this.messageForm.controls.message.value
      && this.currentUser && this.selectedChat) {
      this.message = new MessageDTO(0, 0, 0, 0, false, '', '', '', 0, 0);
      this.message.receiverId = this.selectedChat?.receiverId;
      this.message.chatId = this.selectedChat.chatId;
      this.message.message = this.messageForm.controls.message.value;
      this.chatService.sendMessage(this.message);
      this.messageForm.reset()
      this.scrollToBottomChatMessages = true;
      this.scrollToBottom();
    }
  }

  selectChat(selectedChatId: number): void {
    if (selectedChatId != this.selectedChatId) {
      this.chatLoading = true;
      this.messages = [];
      this.filterMessages = new FilterMessageDTO(0, []);
      this.chatService.getUserChatByChatId(selectedChatId).subscribe(chatRes => {
          if (chatRes.success && chatRes.data) {
            this.selectedChat = chatRes.data;
            this.selectedChatId = selectedChatId;
            this.filterMessages = new FilterMessageDTO(this.selectedChatId, []);
            this.filterMessages.chatId = selectedChatId;
            this.scrollToBottomChatMessages = true;
            this.getUserHistoryMessages().then(() => {
              this.chatLoading = false;
            });
          }
        }
      )
    }
  }

  async getUserHistoryMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.filterMessages.pageId <= this.filterMessages.endPage || this.filterMessages.pageId === 1) {
        this.pages = [];
        this.chatService.getHistoryOfMessages(this.filterMessages).pipe(takeUntil(this.destroyed))
          .subscribe(result => {
            setTimeout(() => {
              if (result.success && this.filterMessages.chatId === result.data?.chatId) {
                this.filterMessages.pageId = this.pageId;
                this.filterMessages = result.data;
                this.messages.unshift(...result.data.messages);
                for (let i = this.filterMessages.startPage; i <= this.filterMessages.endPage; i++) {
                  this.pages.push(i);
                }
                resolve();
              }
            }, 1000);
          }, error => console.log(error));
      }
    })
  }

  async loadData() {
    this.chatMessageLoading = true;
    this.filterMessages.pageId += 1;
    this.scrollToBottomChatMessages = false;
    this.currentScrollHeight = this.userChatListContainer?.nativeElement.scrollHeight;
    await this.getUserHistoryMessages().then(() => {
      this.chatMessageLoading = false;
      // @ts-ignore
      this.userChatListContainer?.nativeElement.scrollTop = this.currentScrollHeight / 5;
    });
  }

  scrollToBottom(): void {
    try {
      if (!this.scrollToBottomChatMessages)
        return;
      if (this.scrollToBottomChatMessages) {
        // @ts-ignore
        this.userChatListContainer?.nativeElement.scrollTop = this.userChatListContainer?.nativeElement.scrollHeight;
      }
    } catch (err) {
    }
  }

  signOutUser(): void {
    if (this.currentUser) {
      this.cookieService.delete(ChatAppCookieName);
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.messageReceiveSubscription?.unsubscribe();
    this.destroyed?.next();
    this.destroyed?.complete();
    this.chatService.stopSignalR();
  }

}
