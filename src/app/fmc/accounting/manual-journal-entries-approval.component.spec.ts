import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualJournalEntriesApprovalComponent } from './manual-journal-entries-approval.component';

describe('ManualJournalEntriesApprovalComponent', () => {
  let component: ManualJournalEntriesApprovalComponent;
  let fixture: ComponentFixture<ManualJournalEntriesApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualJournalEntriesApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualJournalEntriesApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
