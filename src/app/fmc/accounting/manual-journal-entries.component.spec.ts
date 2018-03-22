import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualJournalEntriesComponent } from './manual-journal-entries.component';

describe('ManualJournalEntriesComponent', () => {
  let component: ManualJournalEntriesComponent;
  let fixture: ComponentFixture<ManualJournalEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualJournalEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualJournalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
