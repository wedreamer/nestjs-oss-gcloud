import { Module, DynamicModule } from '@nestjs/common';
import { GcloudOssService } from './gcloud-oss.service';
import { GCloudStoragePerRequestOptions } from '@aginix/nestjs-gcloud-storage';
import { ossProvider } from './oss.provider';
import { OSS_OPTIONS } from './constants/oss_option.constant';


@Module({
  providers: [GcloudOssService],
  exports: [GcloudOssService],
})
export class GcloudOssModule {
  public static forRoot(options: GCloudStoragePerRequestOptions): DynamicModule {
    return {
        module: GcloudOssModule,
        providers: [
            ossProvider(),
            { provide: OSS_OPTIONS, useValue: options }
        ],
        exports: [
          GcloudOssService,
        ]
    };
  }
}
