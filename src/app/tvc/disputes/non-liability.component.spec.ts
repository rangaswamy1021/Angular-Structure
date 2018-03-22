import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonLiabilityComponent } from './non-liability.component';

describe('NonLiabilityComponent', () => {
  let component: NonLiabilityComponent;
  let fixture: ComponentFixture<NonLiabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonLiabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonLiabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
