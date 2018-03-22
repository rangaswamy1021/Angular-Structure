import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerContactComponent } from './retailer-contact.component';

describe('RetailerContactComponent', () => {
  let component: RetailerContactComponent;
  let fixture: ComponentFixture<RetailerContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
