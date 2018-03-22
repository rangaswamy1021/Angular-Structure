import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAutoPayComponent } from './manage-auto-pay.component';

describe('ManageAutoPayComponent', () => {
  let component: ManageAutoPayComponent;
  let fixture: ComponentFixture<ManageAutoPayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAutoPayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAutoPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
