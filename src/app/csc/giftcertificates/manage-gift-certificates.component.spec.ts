import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGiftCertificatesComponent } from './manage-gift-certificates.component';

describe('ManageGiftCertificatesComponent', () => {
  let component:  ManageGiftCertificatesComponent;
  let fixture: ComponentFixture< ManageGiftCertificatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [  ManageGiftCertificatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageGiftCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
