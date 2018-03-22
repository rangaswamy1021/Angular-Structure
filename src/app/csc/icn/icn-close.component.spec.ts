import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnCloseComponent } from './icn-close.component';

describe('IcnCloseComponent', () => {
  let component: IcnCloseComponent;
  let fixture: ComponentFixture<IcnCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnCloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
