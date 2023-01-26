import { TestBed } from '@angular/core/testing';

import { TnkStorage } from './storage.service';

describe('TnkStorage', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TnkStorage = TestBed.get(TnkStorage);
    expect(service).toBeTruthy();
  });
});
