import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesummaryComponent } from './invoicesummary.component';

describe('InvoicesummaryComponent', () => {
  let component: InvoicesummaryComponent;
  let fixture: ComponentFixture<InvoicesummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicesummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
