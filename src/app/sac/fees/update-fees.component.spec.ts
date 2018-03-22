import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFeesComponent } from './update-fees.component';

describe('UpdateFeesComponent', () => {
  let component: UpdateFeesComponent;
  let fixture: ComponentFixture<UpdateFeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateFeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
