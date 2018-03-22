import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NsfCheckDetailsComponent } from './nsf-check-details.component';

describe('NsfCheckDetailsComponent', () => {
  let component: NsfCheckDetailsComponent;
  let fixture: ComponentFixture<NsfCheckDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NsfCheckDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NsfCheckDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
