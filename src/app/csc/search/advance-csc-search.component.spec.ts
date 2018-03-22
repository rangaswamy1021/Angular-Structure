import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceCscSearchComponent } from './advance-csc-search.component';

describe('AdvanceCscSearchComponent', () => {
  let component: AdvanceCscSearchComponent;
  let fixture: ComponentFixture<AdvanceCscSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvanceCscSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceCscSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
