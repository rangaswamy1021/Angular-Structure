import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayByPlateListComponent } from './pay-by-plate-list.component';

describe('PayByPlateListComponent', () => {
  let component: PayByPlateListComponent;
  let fixture: ComponentFixture<PayByPlateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayByPlateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayByPlateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
