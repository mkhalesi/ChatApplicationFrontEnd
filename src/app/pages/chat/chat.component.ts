import {Component, OnInit} from '@angular/core';
import {MessageDTO} from "../../DTOs/chat/MessageDTO";
import {Router} from "@angular/router";
import {ChatService} from "../../services/chat.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  txtMessage = "";
  messages: MessageDTO[] = [];
  // @ts-ignore
  message: MessageDTO = null;
  history: MessageDTO[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private chatService: ChatService,
  ) {
  }

  ngOnInit(): void {
    this.userService.isAuthenticated().then(res => {
        if (!res) {
          this.router.navigate(['/login']);
        }
      }
    )
  }

}
