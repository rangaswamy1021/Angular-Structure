import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidentifiedPaymentsComponent } from './unidentified-payments.component';

describe('UnidentifiedPaymentsComponent', () => {
  let component: UnidentifiedPaymentsComponent;
  let fixture: ComponentFixture<UnidentifiedPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnidentifiedPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnidentifiedPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
