import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitAccountComponent } from './split-account.component';

describe('SplitAccountComponent', () => {
  let component: SplitAccountComponent;
  let fixture: ComponentFixture<SplitAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
