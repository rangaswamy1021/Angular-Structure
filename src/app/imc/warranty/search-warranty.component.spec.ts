import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWarrantyComponent } from './search-warranty.component';

describe('SearchWarrantyComponent', () => {
  let component: SearchWarrantyComponent;
  let fixture: ComponentFixture<SearchWarrantyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchWarrantyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchWarrantyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
