import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServiceDetailsComponent } from './add-service-details.component';

describe('AddServiceDetailsComponent', () => {
  let component: AddServiceDetailsComponent;
  let fixture: ComponentFixture<AddServiceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServiceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
