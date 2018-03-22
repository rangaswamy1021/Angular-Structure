import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DmvHistoryComponent } from './dmv-history.component';

describe('DmvHistoryComponent', () => {
  let component: DmvHistoryComponent;
  let fixture: ComponentFixture<DmvHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmvHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmvHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
