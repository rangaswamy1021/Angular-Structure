import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDisputesComponent } from './view-disputes.component';

describe('ViewDisputesComponent', () => {
  let component: ViewDisputesComponent;
  let fixture: ComponentFixture<ViewDisputesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDisputesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDisputesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
