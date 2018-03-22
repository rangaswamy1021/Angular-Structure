import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePromosComponent } from './manage-promos.component';

describe('ManagePromosComponent', () => {
  let component: ManagePromosComponent;
  let fixture: ComponentFixture<ManagePromosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePromosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePromosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
