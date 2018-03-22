import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolatorSearchDetailsComponent } from './violator-search-details.component';

describe('ViolatorSearchDetailsComponent', () => {
  let component: ViolatorSearchDetailsComponent;
  let fixture: ComponentFixture<ViolatorSearchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolatorSearchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolatorSearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
