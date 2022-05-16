import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApiDomainAddress, ChatAppCookieName} from "./PathTools";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class ChatAppInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get(ChatAppCookieName);
    const myRequest = req.clone({
      url: ApiDomainAddress + req.url,
      headers: req.headers
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Methods', ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'])
        .append('Access-Control-Allow-Headers', '*')
        .append('Authorization', 'Bearer ' + token)
    });
    return next.handle(myRequest);
  }

}
