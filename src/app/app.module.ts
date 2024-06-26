import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {ChatComponent} from './pages/chat/chat.component';
import {LoginComponent} from './pages/login/login.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {ChatAppInterceptor} from "./utilities/ChatAppInterceptor";
import {CookieService} from "ngx-cookie-service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {ToastrModule} from "ngx-toastr";
import {AppRoutingModule} from "./app-routing.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AuthService} from "./services/auth.service";
import {UserService} from "./services/user.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatBadgeModule} from "@angular/material/badge";
import {ChatUserDetailComponent} from './pages/chat/chat-user-detail/chat-user-detail.component';
import { ChatUserPageComponent } from './pages/chat/chat-user-page/chat-user-page.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    LoginComponent,
    ChatUserDetailComponent,
    ChatUserPageComponent
  ],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule,
    ToastrModule.forRoot({
      progressBar: true
    }),
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    InfiniteScrollModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatBadgeModule
  ],
  providers: [
    AuthService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ChatAppInterceptor,
      multi: true,
    },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
