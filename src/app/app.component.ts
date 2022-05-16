import {Component, OnInit} from '@angular/core';
import {CurrentUser} from "./DTOs/User/CurrentUser";
import {AuthService} from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ChatAppSignalRFrontEnd';

  constructor(
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.authService.checkUserAuth().subscribe(res => {
      if (res.success) {
        const user = new CurrentUser(
          res.data.id,
          res.data.firstName,
          res.data.lastName,
          res.data.email,
          res.data.isConfirmed,
        );
        this.authService.setCurrentUser(user);
      }
    })
  }

}
