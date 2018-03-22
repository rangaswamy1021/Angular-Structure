import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGiftCertificateComponent } from './add-gift-certificate.component';

describe('AddGiftCertificateComponent', () => {
  let component: AddGiftCertificateComponent;
  let fixture: ComponentFixture<AddGiftCertificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGiftCertificateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddGiftCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
