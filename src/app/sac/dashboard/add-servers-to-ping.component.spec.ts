import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServersToPingComponent } from './add-servers-to-ping.component';

describe('AddServersToPingComponent', () => {
  let component: AddServersToPingComponent;
  let fixture: ComponentFixture<AddServersToPingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServersToPingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServersToPingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
