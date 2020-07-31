import { GCloudStoragePerRequestOptions, UploadedFileMetadata } from '@aginix/nestjs-gcloud-storage';
import { Bucket, CreateWriteStreamOptions, File, Storage } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';
import { IResUpload } from './interfaces/IResUpload.interfaces';
import { OSS_CONST } from './constants/oss_const.constant';
import { OSS_OPTIONS } from './constants/oss_option.constant';
import { uuid } from './utils/uuid.utils';

@Injectable()
export class GcloudOssService {

  public bucket: Bucket = null;

  constructor(
    @Inject(OSS_CONST) protected readonly storage: Storage,
    @Inject(OSS_OPTIONS) protected readonly options: GCloudStoragePerRequestOptions
  ){
    this.bucket = this.storage.bucket(options.defaultBucketname)
  }

  async upload(
    fileMetadata: UploadedFileMetadata,
    perRequestOptions: Partial<GCloudStoragePerRequestOptions> = null,
  ): Promise<IResUpload | string> {

    const filename =  uuid() 
    let gcFilename =
      this.options && this.options.prefix ? this.options.prefix + filename : filename;

    gcFilename = this.options.storageBaseUri ? [this.options.storageBaseUri, gcFilename].join('/') : gcFilename

    const gcFile : File = this.bucket.file(gcFilename);

    // override global options with the provided ones for this request
    perRequestOptions = {
      ...this.options,
      ...perRequestOptions,
    };

    const writeStreamOptions = perRequestOptions && perRequestOptions.writeStreamOptions;

    const { predefinedAcl = 'private' } = perRequestOptions;
    const streamOpts: CreateWriteStreamOptions = {
      predefinedAcl: predefinedAcl,
      ...writeStreamOptions,
    };

    const contentType = fileMetadata.mimetype;

    if (contentType) {
      streamOpts.metadata = { contentType };
    }

    return new Promise((resolve, reject) => {
      gcFile
        .createWriteStream(streamOpts)
        .on('error', (error) => reject(error))
        .on('finish', () => 
           resolve(this.getStorageUrl(gcFilename, perRequestOptions))
        )
        .end(fileMetadata.buffer);
    });
  }

  getStorageUrl(gcFilename: string, perRequestOptions: Partial<GCloudStoragePerRequestOptions> = null) {
      const uriAtt = ['https://storage.googleapis.com', perRequestOptions.defaultBucketname, gcFilename] 
      return  uriAtt.join('/')
  }

  async download(url: string) {
    const domainIndex = url.indexOf('storage.googleapis.com')
    if(domainIndex != -1) {
      const _att = url.split('storage.googleapis.com')
      _att.shift()
      let fileUrlAtt = _att.pop().split('/')
      fileUrlAtt.shift()
      const bucketName = fileUrlAtt.shift()
      const fileUri = fileUrlAtt.join('/')
      console.log(bucketName, fileUri)
      const bucket = this.storage.bucket(bucketName)
      const file = bucket.file(fileUri)

      const [fileMetadata] = await file.getMetadata()
      const fileBuffers = await file.download()
      return {
        fileMetadata,
        fileBuffers
      }
    }
  }
}
