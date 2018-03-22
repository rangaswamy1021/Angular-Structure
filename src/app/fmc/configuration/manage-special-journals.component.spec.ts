import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSpecialJournalsComponent } from './manage-special-journals.component';

describe('ManageSpecialJournalsComponent', () => {
  let component: ManageSpecialJournalsComponent;
  let fixture: ComponentFixture<ManageSpecialJournalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSpecialJournalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSpecialJournalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
