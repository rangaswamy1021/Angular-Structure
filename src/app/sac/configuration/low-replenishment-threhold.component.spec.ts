import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LowReplenishmentThreholdComponent } from './low-replenishment-threhold.component';

describe('LowReplenishmentThreholdComponent', () => {
  let component: LowReplenishmentThreholdComponent;
  let fixture: ComponentFixture<LowReplenishmentThreholdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LowReplenishmentThreholdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LowReplenishmentThreholdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
