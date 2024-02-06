
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class UserService {
  constructor (private readonly prismaService: PrismaService) {}
  async findById (id: string): Promise<User | null> {
    return await this.prismaService.user.findFirst({
      where: {
        id
      }
    })
  }

  async create (data: Prisma.UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({
      data
    })
  }

  async createBatch (data: Prisma.UserCreateInput[]): Promise<Prisma.BatchPayload> {
    return await this.prismaService.user.createMany({
      data
    })
  }

  async update (id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id
      },
      data
    })
  }

  async findByIds (ids: string[]): Promise<User[]> {
    return await this.prismaService.user.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })
  }

  /**
   * userHash detail
   * @param userIds
   */
  async userHash (userIds: string[]): Promise<Map<string, User>> {
    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: userIds }
      }
    })
    const result = new Map<string, User>()
    users.forEach(u => {
      result.set(u.id, u)
    })
    return result
  }
}
