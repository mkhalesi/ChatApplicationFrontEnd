import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  HostListener, Inject, Input,
  NgZone, OnChanges, OnDestroy,
  OnInit, Output, PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {CurrentUser} from "../../../DTOs/User/CurrentUser";
import {FilterMessageDTO} from "../../../DTOs/chat/FilterMessageDTO";
import {MessageDTO} from "../../../DTOs/chat/MessageDTO";
import {ChatDTO} from "../../../DTOs/chat/ChatDTO";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subject, Subscription} from "rxjs";
import {AuthService} from "../../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ChatService} from "../../../services/chat.service";
import {CookieService} from "ngx-cookie-service";
import {takeUntil} from "rxjs/operators";
import {ReplyToMessageDTO} from "../../../DTOs/chat/replyToMessageDTO";
import {MessageType} from "../../../DTOs/chat/MessageType";
import {ChatAppCookieName} from "../../../utilities/PathTools";
import {isPlatformBrowser} from "@angular/common";
import {GlobalEventManager} from "../../../utilities/GlobalEventManager";

declare function chatScriptFunction(): any;

@Component({
  selector: 'app-chat-user-detail',
  templateUrl: './chat-user-detail.component.html',
  styleUrls: ['./chat-user-detail.component.scss']
})
export class ChatUserDetailComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, OnChanges {
  @ViewChild('endOfUserChat') private userChatListContainer: ElementRef | undefined;

  @Input() selectedChatId: number = 0;
  @Input() callFromSinglePage = false;
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
  messageForm: FormGroup | null = null;
  messageReceiveSubscription: Subscription = new Subscription();
  scrollToBottomChatMessages = true;
  currentScrollHeight = 0;
  replyToMessageDetail: MessageDTO | null = null;
  private destroyed: Subject<void> = new Subject<void>();
  senderMessagesReadTimeUpdateSubscription: Subscription = new Subscription();
  innerWidth = 0;
  @Output() public callGetAllUserChats: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private ngZone: NgZone,
    private cookieService: CookieService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: any,
    private eventManager: GlobalEventManager
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
    });
  }

  ngOnChanges(): void {
    this.onResize();
    this.filterMessages.takeEntity = 15;
    this.messageForm = new FormGroup({
      message: new FormControl(null, [
        Validators.required,
      ])
    });
    if (this.selectedChatId !== 0 && this.selectedChatId) {
      this.loadChatDetails();
      this.eventManager.selectedChatIdEvent.next(this.selectedChatId);
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadChatDetails(): void {
    this.chatLoading = true;
    this.messages = [];
    this.filterMessages = new FilterMessageDTO(0, []);
    this.chatService.getUserChatByChatId(this.selectedChatId).subscribe(chatRes => {
        if (chatRes.success && chatRes.data) {
          this.selectedChat = chatRes.data;
          this.filterMessages = new FilterMessageDTO(this.selectedChatId, []);
          this.filterMessages.chatId = this.selectedChatId;
          this.scrollToBottomChatMessages = true;
          this.getUserHistoryMessages().then(() => {
            this.chatService.callSeenMessages(this.selectedChatId).subscribe(readMsgRes => {
              if (readMsgRes.data) {
                this.chatService.receiverSeenMessages(this.selectedChatId).then(() => {
                  this.callGetAllUserChats.emit(true);
                });
              }
            });
            this.chatLoading = false;
          });
        }
      }
    )
  }

  private subscribeToEvents(): void {
    this.messageReceiveSubscription = this.chatService.messageReceived
      .pipe(takeUntil(this.destroyed))
      .subscribe((message: MessageDTO) => {
        if (message) {
          this.ngZone.run(() => {
            if (message.chatId == this.selectedChatId)
              this.messages.push(message);
            if (this.selectedChatId === message.chatId) {
              if (message.receiverId == this.currentUser?.id) {
                this.chatService.callSeenMessages(this.selectedChatId).subscribe(res => {
                });
              } else if (message.senderId == this.currentUser?.id) {
                this.chatService.callSeenMessages(this.selectedChatId).subscribe(res => {
                  this.chatService.receiverSeenAllMessages(this.selectedChatId).subscribe(readMsgRes => {
                    if (readMsgRes.data) {
                      this.messages.filter(p => !p.readMessage).forEach(msg => {
                        msg.readMessage = true;
                      });
                    }
                  });
                });
              }
            }
          });
        }
      });

    this.senderMessagesReadTimeUpdateSubscription = this.chatService.senderMessagesReadTimeUpdated
      .pipe(takeUntil(this.destroyed))
      .subscribe((updated: boolean) => {
        if (updated) {
          this.ngZone.run(() => {
            this.messages.filter(p => !p.readMessage).forEach(msg => {
              msg.readMessage = true;
            });
          });
        }
      });
  }

  sendToMessage(): void {
    if (this.messageForm && this.messageForm.controls.message.value
      && this.currentUser) {
      if (this.selectedChat) {
        this.message = new MessageDTO(0, 0, 0, 0,
          false, '', '', '', 0,
          0, 0, new ReplyToMessageDTO(0, '', '', 0), false, '');
        this.message.receiverId = this.selectedChat?.receiverId;
        this.message.chatId = this.selectedChat.chatId;
        this.message.message = this.messageForm.controls.message.value;
        if (this.replyToMessageDetail) {
          this.message.messageType = MessageType.ReplyToMessage;
          this.message.replyToMessageId = this.replyToMessageDetail.chatMessageId;
        } else {
          this.message.messageType = MessageType.Message;
        }
        this.chatService.sendMessage(this.message).then(() => {
          this.messageForm?.reset();
          this.replyToMessageDetail = null;
          this.scrollToBottomChatMessages = true;
          this.scrollToBottom();
        });
      }
    }
  }

  async getUserHistoryMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.filterMessages.pageId <= this.filterMessages.endPage || this.filterMessages.pageId === 1) {
        this.pages = [];
        this.chatService.getHistoryOfMessages(this.filterMessages).pipe(takeUntil(this.destroyed))
          .subscribe(result => {
            if (result.success && this.filterMessages.chatId === result.data?.chatId) {
              this.filterMessages.pageId = this.pageId;
              this.filterMessages = result.data;
              this.messages.unshift(...result.data.messages);
              for (let i = this.filterMessages.startPage; i <= this.filterMessages.endPage; i++) {
                this.pages.push(i);
              }
              resolve();
            }
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

  replyToMessage(message: MessageDTO): void {
    this.replyToMessageDetail = message;
    this.elRef.nativeElement.querySelector('.message-input').focus();
  }

  scrollToRepliedMessage(replyToMessageId: number) {
    const repliedElement = this.elRef.nativeElement.querySelector(`#msg${replyToMessageId}`);
    if (repliedElement) {
      repliedElement.scrollIntoView({behavior: 'smooth'})
      repliedElement.style.opacity = '0.8'
      repliedElement.style.boxShadow = '3px 3px 10px #ccc'
      setTimeout(() => {
        repliedElement.style.opacity = '1';
        repliedElement.style.boxShadow = 'unset'
      }, 500)
    }
  }

  ngOnDestroy(): void {
    this.messageReceiveSubscription?.unsubscribe();
    this.senderMessagesReadTimeUpdateSubscription?.unsubscribe();
    this.destroyed?.next();
    this.destroyed?.complete();
    this.chatService.stopSignalR();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth;
      if (this.innerWidth < 1000) {
      }
    }
  }
}

