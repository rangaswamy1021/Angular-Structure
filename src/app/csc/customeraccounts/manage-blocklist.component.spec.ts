import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBlocklistComponent } from './manage-blocklist.component';

describe('ManageBlocklistComponent', () => {
  let component: ManageBlocklistComponent;
  let fixture: ComponentFixture<ManageBlocklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBlocklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBlocklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
