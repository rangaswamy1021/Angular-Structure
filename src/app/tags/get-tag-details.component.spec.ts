import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTagDetailsComponent } from './get-tag-details.component';

describe('GetTagDetailsComponent', () => {
  let component: GetTagDetailsComponent;
  let fixture: ComponentFixture<GetTagDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetTagDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetTagDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
