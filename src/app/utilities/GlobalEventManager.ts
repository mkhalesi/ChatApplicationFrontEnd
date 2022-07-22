import {EventEmitter, Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GlobalEventManager {
  public selectedChatIdEvent: EventEmitter<number> = new EventEmitter<number>();
}


