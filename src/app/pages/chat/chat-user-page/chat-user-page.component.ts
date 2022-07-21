import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth.service";
import {CurrentUser} from "../../../DTOs/User/CurrentUser";

@Component({
  selector: 'app-chat-user-page',
  templateUrl: './chat-user-page.component.html',
  styleUrls: ['./chat-user-page.component.scss']
})
export class ChatUserPageComponent implements OnInit {

  selectedChatId = 0;
  currentUser: CurrentUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      if (params.chatId) {
        this.selectedChatId = parseInt(params.chatId, 0);
        this.authService.getCurrentUser().subscribe(res => {
          this.authService.isAuthenticated().then(auth => {
            if (!auth)
              this.router.navigate(['/login']);
          })
          this.currentUser = res;
        });
      } else {
        this.router.navigate(['chat']);
      }
    });
  }

}
