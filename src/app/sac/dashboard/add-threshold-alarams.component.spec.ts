import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddThresholdAlaramsComponent } from './add-threshold-alarams.component';

describe('AddThresholdAlaramsComponent', () => {
  let component: AddThresholdAlaramsComponent;
  let fixture: ComponentFixture<AddThresholdAlaramsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddThresholdAlaramsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddThresholdAlaramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
