import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnAssignComponent } from './icn-assign.component';

describe('IcnAssignComponent', () => {
  let component: IcnAssignComponent;
  let fixture: ComponentFixture<IcnAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
