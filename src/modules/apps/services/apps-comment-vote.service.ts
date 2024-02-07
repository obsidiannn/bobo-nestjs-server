import { PrismaService } from '@/modules/common/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AppCommentVoteResp } from '../controllers/apps.dto'

@Injectable()
export class AppsCommentVoteService {
  constructor (
    private readonly prisma: PrismaService
  ) {}

  async findVoteByCommentIds (commentIds: string[], uid: string): Promise<Set<string>> {
    const data = await this.prisma.appCommentVote.findMany({
      where: {
        uid,
        commentId: { in: commentIds }
      },
      select: { commentId: true }
    })
    return new Set<string>(data.map(d => d.commentId))
  }

  async doVote (uid: string, commentId: string): Promise<AppCommentVoteResp> {
    const data = await this.prisma.appCommentVote.findFirst({
      where: {
        uid
      }
    })
    if (data !== null) {
      await this.prisma.appCommentVote.delete({ where: { id: data.id } })
      return { commentId, voteFlag: false }
    } else {
      const input: Prisma.AppCommentVoteCreateInput = {
        commentId,
        uid
      }
      await this.prisma.appCommentVote.create({ data: input })
      return { commentId, voteFlag: true }
    }
  }
}
