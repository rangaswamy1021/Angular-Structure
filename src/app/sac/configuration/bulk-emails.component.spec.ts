import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEmailsComponent } from './bulk-emails.component';

describe('BulkEmailsComponent', () => {
  let component: BulkEmailsComponent;
  let fixture: ComponentFixture<BulkEmailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkEmailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
