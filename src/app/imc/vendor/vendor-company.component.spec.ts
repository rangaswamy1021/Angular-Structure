import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorCompanyComponent } from './vendor-company.component';

describe('VendorCompanyComponent', () => {
  let component: VendorCompanyComponent;
  let fixture: ComponentFixture<VendorCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
