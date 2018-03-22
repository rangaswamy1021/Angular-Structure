import { TestBed, inject } from '@angular/core/testing';

import { MaterialscriptService } from './materialscript.service';

describe('MaterialscriptService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaterialscriptService]
    });
  });

  it('should be created', inject([MaterialscriptService], (service: MaterialscriptService) => {
    expect(service).toBeTruthy();
  }));
});
