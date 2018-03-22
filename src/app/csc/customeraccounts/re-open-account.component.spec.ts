import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReOpenAccountComponent } from './re-open-account.component';

describe('ReOpenAccountComponent', () => {
  let component: ReOpenAccountComponent;
  let fixture: ComponentFixture<ReOpenAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReOpenAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReOpenAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
