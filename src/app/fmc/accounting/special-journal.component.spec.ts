import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialJournalComponent } from './special-journal.component';

describe('SpecialJournalComponent', () => {
  let component: SpecialJournalComponent;
  let fixture: ComponentFixture<SpecialJournalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialJournalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
