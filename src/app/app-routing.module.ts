import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ChatComponent} from "./pages/chat/chat.component";
import {LoginComponent} from "./pages/login/login.component";
import {ChatUserPageComponent} from "./pages/chat/chat-user-page/chat-user-page.component";

const routes: Routes = [
  {path: '', component: ChatComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'chat/:chatId', component: ChatUserPageComponent},
  {path: 'login', component: LoginComponent},
  {path: '**', component: ChatComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
