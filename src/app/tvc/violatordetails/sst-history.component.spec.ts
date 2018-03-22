import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SstHistoryComponent } from './sst-history.component';

describe('SstHistoryComponent', () => {
  let component: SstHistoryComponent;
  let fixture: ComponentFixture<SstHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SstHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SstHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
