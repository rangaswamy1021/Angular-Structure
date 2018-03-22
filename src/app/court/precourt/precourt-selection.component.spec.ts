import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecourtComponent } from './precourt-selection.component';

describe('PrecourtComponent', () => {
  let component: PrecourtComponent;
  let fixture: ComponentFixture<PrecourtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrecourtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecourtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
