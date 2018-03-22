import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTagsConfigurationsComponent } from './get-tags-configurations.component';

describe('GetTagsConfigurationsComponent', () => {
  let component: GetTagsConfigurationsComponent;
  let fixture: ComponentFixture<GetTagsConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetTagsConfigurationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetTagsConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
