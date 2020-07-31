import { Injectable, Inject } from '@nestjs/common';
import { Bucket, CreateWriteStreamOptions } from '@google-cloud/storage';
import { GCLOUD_STORAGE_MODULE_OPTIONS, GCloudStorageOptions, UploadedFileMetadata, GCloudStoragePerRequestOptions } from '@aginix/nestjs-gcloud-storage';
import { join } from 'path';

/**
 * https://gist.github.com/jed/982883
 * @param a
 */
const uuid = (a: string = ''): string =>
  a
    ? /* eslint-disable no-bitwise */
      ((Number(a) ^ (Math.random() * 16)) >> (Number(a) / 4)).toString(16)
    : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, uuid);

@Injectable()
export class AppService {
  public storage: Storage = new Storage();
  public bucket: Bucket = null;

  constructor(@Inject(GCLOUD_STORAGE_MODULE_OPTIONS) private readonly options: GCloudStorageOptions) {

    const bucketName = this.options.defaultBucketname;
    this.bucket = this.storage.bucket(bucketName);
  }

  async upload(
    fileMetadata: UploadedFileMetadata,
    perRequestOptions: Partial<GCloudStoragePerRequestOptions> = null,
  ): Promise<string> {
    const filename = uuid();
    const gcFilename =
      perRequestOptions && perRequestOptions.prefix ? join(perRequestOptions.prefix, filename) : filename;
    const gcFile = this.bucket.file(gcFilename);

    // override global options with the provided ones for this request
    perRequestOptions = {
      ...this.options,
      ...perRequestOptions,
    };

    const writeStreamOptions = perRequestOptions && perRequestOptions.writeStreamOptions;

    const { predefinedAcl = 'publicRead' } = perRequestOptions;
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
        .on('finish', () => resolve(this.getStorageUrl(gcFilename, perRequestOptions)))
        .end(fileMetadata.buffer);
    });
  }

  getStorageUrl(filename: string, perRequestOptions: Partial<GCloudStoragePerRequestOptions> = null) {
    if (perRequestOptions && perRequestOptions.storageBaseUri) {
      return join(perRequestOptions.storageBaseUri, filename);
    }
    return 'https://storage.googleapis.com/' + join(perRequestOptions.defaultBucketname, filename);
  }
}
