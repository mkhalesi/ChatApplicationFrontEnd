import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {LoginUserDTO} from "../DTOs/User/LoginUserDTO";
import {IResponseResult} from "../DTOs/Common/IResponseResult";
import {LoginResponseDTO} from "../DTOs/User/LoginResponseDTO";
import {CurrentUser} from "../DTOs/User/CurrentUser";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedIn = false;
  // @ts-ignore
  private currentUser: BehaviorSubject<CurrentUser> = new BehaviorSubject<CurrentUser>(null);

  constructor(private http: HttpClient) {
  }

  setCurrentUser(user: CurrentUser): void {
    this.currentUser.next(user);
  }

  isAuthenticated() {
    const promise = new Promise((resolve, reject) => {
      resolve(this.loggedIn);
    });
    return promise;
  }

  getCurrentUser(): Observable<CurrentUser> {
    if (this.currentUser !== null) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
    return this.currentUser;
  }

  LoginUser(loginUserDTO: LoginUserDTO): Observable<IResponseResult<LoginResponseDTO>> {
    return this.http.post<IResponseResult<LoginResponseDTO>>('/api/auth/login', loginUserDTO);
  }

}
