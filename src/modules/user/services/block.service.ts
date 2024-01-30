import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Blacklist, Prisma } from '@prisma/client'

@Injectable()
export class BlockService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async checkExist (uid: string, objUid: string): Promise<boolean> {
    return await this.prisma.blacklist.count({
      where: {
        uid,
        objUid
      }
    }) > 0
  }

  async create (input: Prisma.BlacklistCreateInput): Promise<Blacklist> {
    return await this.prisma.blacklist.create({ data: input })
  }

  async delete (uid: string, objUid: string): Promise<Prisma.BatchPayload> {
    return await this.prisma.blacklist.deleteMany({
      where: {
        uid,
        objUid
      }
    })
  }

  async findManyByUid (uid: string): Promise<Blacklist[]> {
    return await this.prisma.blacklist.findMany({
      where: { uid },
      orderBy: {
        createdAt: 'asc'
      }
    })
  }
}
