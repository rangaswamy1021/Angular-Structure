import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EzPassOutboundTransactionsCorrectionsComponent } from './ez-pass-outbound-transactions-corrections.component';

describe('EzPassOutboundTransactionsCorrectionsComponent', () => {
  let component: EzPassOutboundTransactionsCorrectionsComponent;
  let fixture: ComponentFixture<EzPassOutboundTransactionsCorrectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EzPassOutboundTransactionsCorrectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EzPassOutboundTransactionsCorrectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
