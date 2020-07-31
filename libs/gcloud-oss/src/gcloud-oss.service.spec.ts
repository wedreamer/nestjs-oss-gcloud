import { Test, TestingModule } from '@nestjs/testing';
import { GcloudOssService } from './gcloud-oss.service';

describe('GcloudOssService', () => {
  let service: GcloudOssService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcloudOssService],
    }).compile();

    service = module.get<GcloudOssService>(GcloudOssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
