import { Storage } from '@google-cloud/storage';
import { StorageOptions } from '@google-cloud/storage';
import { OSS_CONST } from './constants/oss_const.constant';
import { OSS_OPTIONS } from './constants/oss_option.constant';



export const ossProvider = () => ({
    provide: OSS_CONST,
    useFactory: (options: StorageOptions) => {
		  return new Storage(options);
    },
    inject: [OSS_OPTIONS]
});
