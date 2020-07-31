
# nest-oss-gcloud 
> 对gcloud storage 封装 (参考 [@nest-public/nest-oss](https://github.com/p455555555/nest-oss) [@aginix/nestjs-gcloud-storage](https://github.com/aginix/nestjs-gcloud-storage))

注意：<font color="#dd0000"> 仍在开发中，目前仅在内部使用 </font><br /> 
[Nest](https://github.com/nestjs/nest)框架 谷歌云 storage (gcloud storage) 上传插件

## 使用说明
外部人员仅供参考，请不要用于生产环境，因此导致的事故后果请自行承担。 

## 安装

```bash
$ npm i @shubuzuo/nestjs-oss-gcloud
```
or 
```bash
$ yarn add @shubuzuo/nestjs-oss-gcloud
```

## 用法
config.js 配置
```javascript
// 你的 身份信息 JSON 文件所在位置
const keyFilename = path.join(__dirname, "../src/config/****.json")
export const config = {
      //默认 存储桶名
      defaultBucketname: 'your bacuetName',
      //存储桶 基本路径
      storageBaseUri: 'image',// image/test, image/2010-10-10/test, 首尾不需 带 /
      //存储规则
      predefinedAcl: 'private', // Default is private
      //key 所放路径名
      keyFilename: keyFilename,
      //项目 id
      projectId: '***-***-***',
      //文件名前缀
      prefix: 'test-'
      //最终url https://storage.googleapis.com/your bacuetName/image/test-{上传unid文件名}
}
```

module.ts
```javascript
import { Storage } from '@google-cloud/storage';
import { Module } from '@nestjs/common';
import { GcloudOssModule } from 'lib/gcloud-oss';
import * as path from 'path';
import { AppController } from './app.controller';

//身份信息 所在路径
const keyFilename = path.join(__dirname, "../src/config/****.json")

const config = {
      //默认 存储桶名
      defaultBucketname: 'your bacuetName',
      //存储桶 基本路径
      storageBaseUri: 'image',// image/test, image/2010-10-10/test, 首尾不需 带 /
      //存储规则
      predefinedAcl: 'private', // Default is private
      //key 所放路径名
      keyFilename: keyFilename,
      //项目 id
      projectId: '***-***-***',
      //文件名前缀
      prefix: 'test-'
}

@Module({
  imports: [
    GcloudOssModule.forRoot(config),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
```
controller.ts
```javascript
import { UploadedFileMetadata } from '@aginix/nestjs-gcloud-storage';
import { Controller, Get, Post, UploadedFile, UseInterceptors, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GcloudOssService } from 'lib/gcloud-oss';
import { Response } from 'express';


@Controller()
export class AppController {
  constructor(
    private readonly storageService: GcloudOssService,
  ) {}

  @Post('gcs/upload')
  @UseInterceptors(FileInterceptor('file'))
  async UploadedFilesUsingInterceptor(
    @UploadedFile()
    file: UploadedFileMetadata,
  ) {
    const res = await this.storageService.upload(file)
    return res
  }

  @Get('gcs/download')
  async download(
    @Query('file') url: string,
    @Res() res: Response
  ) : Promise<Buffer | any> {
    let { fileBuffers, fileMetadata } = await this.storageService.download(url)

    res.setHeader('Content-type', fileMetadata.contentType)

    res.send(fileBuffers[0])
  }
}
```
