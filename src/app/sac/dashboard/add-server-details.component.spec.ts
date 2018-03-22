import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServerDetailsComponent } from './add-server-details.component';

describe('AddServerDetailsComponent', () => {
  let component: AddServerDetailsComponent;
  let fixture: ComponentFixture<AddServerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
