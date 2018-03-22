import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBusinessProcessCodesComponent } from './manage-business-process-codes.component';

describe('ManageBusinessProcessCodesComponent', () => {
  let component: ManageBusinessProcessCodesComponent;
  let fixture: ComponentFixture<ManageBusinessProcessCodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBusinessProcessCodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBusinessProcessCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
