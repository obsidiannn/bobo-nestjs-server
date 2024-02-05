import { PrismaService } from '@/modules/common/services/prisma.service'
import { UserService } from '@/modules/user/services/user.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppsService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) { }
}
