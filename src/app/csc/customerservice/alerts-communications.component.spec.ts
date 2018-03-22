import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsCommunicationsComponent } from './alerts-communications.component';

describe('AlertsCommunicationsComponent', () => {
  let component: AlertsCommunicationsComponent;
  let fixture: ComponentFixture<AlertsCommunicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertsCommunicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsCommunicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
