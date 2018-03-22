import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolatorRefundFormComponent } from './violator-refund-form.component';

describe('ViolatorRefundFormComponent', () => {
  let component: ViolatorRefundFormComponent;
  let fixture: ComponentFixture<ViolatorRefundFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolatorRefundFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolatorRefundFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
