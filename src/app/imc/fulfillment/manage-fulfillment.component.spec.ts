import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFulfillmentComponent } from './manage-fulfillment.component';

describe('ManageFulfillmentComponent', () => {
  let component: ManageFulfillmentComponent;
  let fixture: ComponentFixture<ManageFulfillmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageFulfillmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageFulfillmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
