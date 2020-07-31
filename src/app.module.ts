import { Module } from '@nestjs/common';
import { GcloudOssModule } from 'lib/gcloud-oss';
import * as path from 'path';
import { AppController } from './app.controller';

const keyFilename = path.join(__dirname, "../src/config/charged-ground-276206-a80064fb264a.json")


@Module({
  imports: [
    GcloudOssModule.forRoot({
      defaultBucketname: 'test-123-abc',
      storageBaseUri: 'image',
      predefinedAcl: 'publicRead', // Default is private
      keyFilename: keyFilename,
      projectId: 'charged-ground-276206',
      prefix: 'test-'
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
