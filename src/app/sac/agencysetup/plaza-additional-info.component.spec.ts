import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlazaAdditionalInfoComponent } from './plaza-additional-info.component';

describe('PlazaAdditionalInfoComponent', () => {
  let component: PlazaAdditionalInfoComponent;
  let fixture: ComponentFixture<PlazaAdditionalInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlazaAdditionalInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlazaAdditionalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
