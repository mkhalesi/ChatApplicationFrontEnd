import {
  AfterViewInit,
  Component,
  ElementRef, HostListener, Inject,
  NgZone,
  OnDestroy,
  OnInit, PLATFORM_ID,
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
import {CookieService} from "ngx-cookie-service";
import {ChatAppCookieName} from "../../utilities/PathTools";
import {isPlatformBrowser} from "@angular/common";

declare function chatScriptFunction(): any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('endOfUserChat') private userChatListContainer: ElementRef | undefined;

  chatLoading = true;
  currentUser: CurrentUser | null = null;
  allUserChats: ChatDTO[] = [];
  selectedChatId = 0;
  messageReceiveSubscription: Subscription = new Subscription();
  private destroyed: Subject<void> = new Subject<void>();
  senderMessagesReadTimeUpdateSubscription: Subscription = new Subscription();
  innerWidth = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private chatService: ChatService,
    private ngZone: NgZone,
    private cookieService: CookieService,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
  }

  ngOnInit(): void {
    this.onResize();
    chatScriptFunction();
    this.authService.getCurrentUser().subscribe(res => {
      this.authService.isAuthenticated().then(auth => {
        if (!auth)
          this.router.navigate(['/login']);
      })
      this.currentUser = res;
    });
    this.subscribeToEvents();
    this.getUserChats();
  }

  ngAfterViewInit(): void {
  }

  private subscribeToEvents(): void {
    this.messageReceiveSubscription = this.chatService.messageReceived
      .pipe(takeUntil(this.destroyed))
      .subscribe((message: MessageDTO) => {
        if (this.selectedChatId !== message.chatId) {
          this.getUserChats();
        }
      });
  }

  callGetAllUserChats(event: boolean): void {
    if (event) this.getUserChats();
  }

  getUserChats() {
    this.chatService.getALlUserChats().subscribe(chatsRes => {
      if (chatsRes.success && chatsRes.data && chatsRes.data.length > 0) {
        this.allUserChats = chatsRes.data;
      }
    });
  }

  selectChat(selectedChatId: number): void {
    if (selectedChatId !== 0 && selectedChatId != this.selectedChatId) {
      this.chatLoading = true;
      if (this.innerWidth > 700) {
        this.selectedChatId = selectedChatId;
      } else {
        this.router.navigate(['/chat', selectedChatId]);
      }
    }
  }

  signOutUser(): void {
    if (this.currentUser
    ) {
      this.cookieService.delete(ChatAppCookieName);
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.messageReceiveSubscription?.unsubscribe();
    this.senderMessagesReadTimeUpdateSubscription?.unsubscribe();
    this.destroyed?.next();
    this.destroyed?.complete();
    /*this.chatService.stopSignalR();*/
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth;
      if (this.innerWidth < 700) {
        this.selectedChatId = 0;
      }
    }
  }
}
