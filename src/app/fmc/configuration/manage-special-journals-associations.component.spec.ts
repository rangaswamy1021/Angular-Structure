import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSpecialJournalsAssociationsComponent } from './manage-special-journals-associations.component';

describe('ManageSpecialJournalsAssociationsComponent', () => {
  let component: ManageSpecialJournalsAssociationsComponent;
  let fixture: ComponentFixture<ManageSpecialJournalsAssociationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSpecialJournalsAssociationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSpecialJournalsAssociationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
