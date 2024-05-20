
import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { OfficialUser, Prisma, User } from '@prisma/client'
import { UserInfoItem } from '../controllers/user.dto'
import { CurrencyTypeEnum, GenderEnum, OfficialUserTypeEnum, WalletTypeEnum } from '@/enums'
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
    // 增加钱包数据
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

  async findOfficialUserByIds (ids: string[]): Promise<OfficialUser[]> {
    const data = await this.prismaService.officialUser.findMany({
      where: {
        type: OfficialUserTypeEnum.SYSTEM_CHAT,
        status: 1,
        id: { in: ids }
      }
    })
    return data
  }

  async findUserSequence (ids: string[]): Promise<number[]> {
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        userSequence: true
      }
    })
    return users.map(u => u.userSequence)
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

  async findTokenByIds (ids: string[]): Promise<string[]> {
    const list = await this.prismaService.user.findMany({
      where: {
        id: { in: ids },
        msgToken: { not: null }
      },
      select: {
        msgToken: true
      }
    })
    return list.filter(i => i.msgToken !== undefined && i.msgToken !== null).map(l => l.msgToken ?? '')
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
