import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUserDetailComponent } from './chat-user-detail.component';

describe('ChatUserDetailComponent', () => {
  let component: ChatUserDetailComponent;
  let fixture: ComponentFixture<ChatUserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatUserDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
