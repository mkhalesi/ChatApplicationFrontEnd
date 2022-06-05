import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {LoginUserDTO} from "../../DTOs/User/LoginUserDTO";
import {BadRequest, InternalServerError, InvalidCredential} from "../../DTOs/Common/ErrorCode";
import {CurrentUser} from "../../DTOs/User/CurrentUser";
import {ChatAppCookieName} from "../../utilities/PathTools";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.router.navigate(['/chat']);
      }
    })
    this.loginForm = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl(null, [
        Validators.minLength(6),
        Validators.required,
        Validators.maxLength(100),
      ]),
    });
  }

  submitLoginForm(): void {
    if (this.loginForm && this.loginForm.valid) {
      const loginData = new LoginUserDTO(
        this.loginForm.controls.email.value,
        this.loginForm.controls.password.value,
      );
      this.authService.LoginUser(loginData).subscribe(res => {
        if (res.success) {
          const currentUser = new CurrentUser(
            res.data.user.id,
            res.data.user.firstName,
            res.data.user.lastName,
            res.data.user.email,
            res.data.user.isConfirmed,
          );
          this.cookieService.set(ChatAppCookieName, res.data.token, 6000);
          this.authService.setCurrentUser(currentUser);
          this.loginForm?.reset();
          this.toastrService.success('Login successfully', 'Success');
          this.router.navigate(['/']);
        } else if (res.errorCode === BadRequest) {
          this.toastrService.error(res.errorMessage, 'BadRequest');
        } else if (res.errorCode === InvalidCredential) {
          this.toastrService.error(res.errorMessage, 'InvalidCredential');
        } else if (res.errorCode === InternalServerError) {
          this.toastrService.error(res.errorMessage, 'InternalServerError');
        }
      });
    }
  }

}
