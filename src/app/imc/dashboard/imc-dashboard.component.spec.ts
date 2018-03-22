import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImcDashboardComponent } from './imc-dashboard.component';

describe('ImcDashboardComponent', () => {
  let component: ImcDashboardComponent;
  let fixture: ComponentFixture<ImcDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImcDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImcDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
