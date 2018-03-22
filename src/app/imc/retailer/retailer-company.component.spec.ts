import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerCompanyComponent } from './retailer-company.component';

describe('RetailerCompanyComponent', () => {
  let component: RetailerCompanyComponent;
  let fixture: ComponentFixture<RetailerCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
