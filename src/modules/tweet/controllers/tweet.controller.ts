import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Controller, UseInterceptors } from '@nestjs/common'

@UseInterceptors(CryptInterceptor, BaseInterceptor)
@Controller('tweet')
export class TweetController {

}
