import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBankinformationComponent } from './add-bankinformation.component';

describe('AddBankinformationComponent', () => {
  let component: AddBankinformationComponent;
  let fixture: ComponentFixture<AddBankinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBankinformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBankinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
