import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTagsConfigurationComponent } from './update-tags-configuration.component';

describe('UpdateTagsConfigurationComponent', () => {
  let component: UpdateTagsConfigurationComponent;
  let fixture: ComponentFixture<UpdateTagsConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateTagsConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTagsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
