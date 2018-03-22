import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AffidavitSearchViolatorComponent } from './affidavit-search-violator.component';

describe('AffidavitSearchViolatorComponent', () => {
  let component: AffidavitSearchViolatorComponent;
  let fixture: ComponentFixture<AffidavitSearchViolatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AffidavitSearchViolatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AffidavitSearchViolatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
