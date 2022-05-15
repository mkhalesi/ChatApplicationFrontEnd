import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ChatComponent} from "./pages/chat/chat.component";
import {LoginComponent} from "./pages/login/login.component";

const routes: Routes = [
  {path: '', component: ChatComponent},
  {path: 'login', component: LoginComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
