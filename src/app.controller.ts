import { UploadedFileMetadata } from '@aginix/nestjs-gcloud-storage';
import { Controller, Get, Post, UploadedFile, UseInterceptors, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GcloudOssService } from 'lib/gcloud-oss';
import { Response } from 'express';


@Controller()
export class AppController {
  constructor(
    private readonly storageService: GcloudOssService
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
