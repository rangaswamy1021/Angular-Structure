import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTollRatesComponent } from './manage-toll-rates.component';

describe('ManageTollRatesComponent', () => {
  let component: ManageTollRatesComponent;
  let fixture: ComponentFixture<ManageTollRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTollRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTollRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
