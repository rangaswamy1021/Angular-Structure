import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitycodeTagToHexadecimalComponent } from './facilitycode-tag-to-hexadecimal.component';

describe('FacilitycodeTagToHexadecimalComponent', () => {
  let component: FacilitycodeTagToHexadecimalComponent;
  let fixture: ComponentFixture<FacilitycodeTagToHexadecimalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilitycodeTagToHexadecimalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilitycodeTagToHexadecimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
