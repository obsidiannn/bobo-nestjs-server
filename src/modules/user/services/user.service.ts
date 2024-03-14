
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { UserInfoItem } from '../controllers/user.dto'
import { CurrencyTypeEnum, GenderEnum, WalletTypeEnum } from '@/enums'
import commonUtil from '@/utils/common.util'

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
    const user = await this.prismaService.user.create({
      data
    })
    const wallet: Prisma.WalletCreateInput = {
      uid: user.id,
      balance: 0,
      type: WalletTypeEnum.NORMAL,
      currency: CurrencyTypeEnum.USD
    }
    await this.prismaService.wallet.create({ data: wallet })
    return user
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
   * @returns
   */
  async userHash (userIds: string[]): Promise<Map<string, UserInfoItem>> {
    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        gender: true,
        nameIdx: true,
        pubKey: true
      }
    })
    const result = new Map<string, UserInfoItem>()
    users.forEach(u => {
      result.set(u.id, {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        gender: u.gender,
        nameIndex: u.nameIdx,
        pubKey: u.pubKey
      })
    })
    return result
  }

  async checkById (id: string): Promise<UserInfoItem | null> {
    if (!commonUtil.notNull(id)) {
      return null
    }
    const result = await this.prismaService.user.findFirst({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        gender: true,
        nameIdx: true
      }
    })
    if (result === null) {
      return null
    }
    return {
      id: result?.id,
      name: result?.name,
      avatar: result?.avatar,
      gender: result?.gender,
      nameIndex: result?.nameIdx ?? '',
      pubKey: ''
    }
  }

  defaultUserItem: UserInfoItem = {
    id: 'default',
    name: '已注销',
    avatar: '',
    gender: GenderEnum.UNKNOWN,
    nameIndex: '',
    pubKey: ''
  }
}
