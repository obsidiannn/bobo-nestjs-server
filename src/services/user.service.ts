import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class UserService {
  constructor (private readonly prisma: PrismaService) { }

  async findById (id: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { id }
    })
  }

  async create (data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data })
  }

  async findByIds (ids: string[]): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { id: { in: ids } }
    })
  }
}
