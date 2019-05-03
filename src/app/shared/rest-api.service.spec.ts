import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RestApiService } from './rest-api.service';

describe('RestApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [RestApiService],
    imports: [ HttpClientModule ]
  }));

  it('should be created', () => {
    const service: RestApiService = TestBed.get(RestApiService);
    expect(service).toBeTruthy();
  });
});
