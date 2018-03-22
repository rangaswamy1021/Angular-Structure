import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadBalancingConfigurationsForMbsComponent } from './load-balancing-configurations-for-mbs.component';

describe('LoadBalancingConfigurationsForMbsComponent', () => {
  let component: LoadBalancingConfigurationsForMbsComponent;
  let fixture: ComponentFixture<LoadBalancingConfigurationsForMbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadBalancingConfigurationsForMbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadBalancingConfigurationsForMbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
