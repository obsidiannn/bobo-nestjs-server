import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Prisma, User } from '@prisma/client'
import { randomUUID } from 'crypto'
import { CommonEnum } from '@/dto/common'
@Injectable()
export class UserService {
  constructor (private readonly prisma: PrismaService) { }

  async findById (id: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { id }
    })
  }

  async findByUId (id: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { unionId: id }
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

  async findByUIds (ids: string[]): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { unionId: { in: ids } }
    })
  }

  user2GroupMemberInput (user: User, groupId: string): Prisma.GroupMembersCreateInput {
    const member: Prisma.GroupMembersCreateInput = {
      id: randomUUID(),
      groupId,
      uid: user.unionId,
      encPri: '',
      encKey: '',
      inviteUid: 'todo',
      role: 3,
      joinType: 1,
      myAlias: user.name,
      status: CommonEnum.ON,
      banType: CommonEnum.ON
    }
    return member
  }
}
