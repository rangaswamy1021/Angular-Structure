import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleJobsConfigurationComponent } from './console-jobs-configuration.component';

describe('ConsoleJobsConfigurationComponent', () => {
  let component: ConsoleJobsConfigurationComponent;
  let fixture: ComponentFixture<ConsoleJobsConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsoleJobsConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsoleJobsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
