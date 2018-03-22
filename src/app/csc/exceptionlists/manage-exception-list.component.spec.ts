import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExceptionListComponent } from './manage-exception-list.component';

describe('ManageExceptionListComponent', () => {
  let component: ManageExceptionListComponent;
  let fixture: ComponentFixture<ManageExceptionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageExceptionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageExceptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
