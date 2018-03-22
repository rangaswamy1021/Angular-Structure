import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarycomplaintComponent } from './summarycomplaint.component';

describe('SummarycomplaintComponent', () => {
  let component: SummarycomplaintComponent;
  let fixture: ComponentFixture<SummarycomplaintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarycomplaintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarycomplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
