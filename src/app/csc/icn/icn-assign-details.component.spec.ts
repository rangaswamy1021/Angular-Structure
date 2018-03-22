import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnAssignDetailsComponent } from './icn-assign-details.component';

describe('IcnAssignDetailsComponent', () => {
  let component: IcnAssignDetailsComponent;
  let fixture: ComponentFixture<IcnAssignDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnAssignDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnAssignDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
