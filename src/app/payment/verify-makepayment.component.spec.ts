import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyMakepaymentComponent } from './verify-makepayment.component';

describe('VerifyMakepaymentComponent', () => {
  let component: VerifyMakepaymentComponent;
  let fixture: ComponentFixture<VerifyMakepaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyMakepaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyMakepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
