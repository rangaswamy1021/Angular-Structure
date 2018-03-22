import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnCountOutComponent } from './icn-count-out.component';

describe('IcnCountOutComponent', () => {
  let component: IcnCountOutComponent;
  let fixture: ComponentFixture<IcnCountOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnCountOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnCountOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
