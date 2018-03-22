import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerBusinessComponent } from './retailer-business.component';

describe('RetailerBusinessComponent', () => {
  let component: RetailerBusinessComponent;
  let fixture: ComponentFixture<RetailerBusinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerBusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
