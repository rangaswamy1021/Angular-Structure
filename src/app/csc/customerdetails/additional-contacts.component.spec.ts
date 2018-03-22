import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalContactsComponent } from './additional-contacts.component';

describe('AdditionalContactsComponent', () => {
  let component: AdditionalContactsComponent;
  let fixture: ComponentFixture<AdditionalContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
