import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTrackingComponent } from './inventory-tracking.component';

describe('InventoryTrackingComponent', () => {
  let component: InventoryTrackingComponent;
  let fixture: ComponentFixture<InventoryTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
