import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnHistoryComponent } from './icn-history.component';

describe('IcnHistoryComponent', () => {
  let component: IcnHistoryComponent;
  let fixture: ComponentFixture<IcnHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
