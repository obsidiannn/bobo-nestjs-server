import { BaseInterceptor } from '@/modules/auth/interceptors/base.interceptor'
import { CryptInterceptor } from '@/modules/common/interceptors/crypt.interceptor'
import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common'
import { WalletService } from '../services/wallet.service'
import { BillService } from '../services/bill.service'
import { BaseIdReq, BasePageResp } from '@/modules/common/dto/common.dto'
import { BillDetailResp, BillRecordItem, BillRecordReq } from './wallet.dto'
import { Request } from 'express'
import { BillDetailService } from '../services/bill.detail.service'
import { BusinessTypeEnum } from '@/enums'
import { UserService } from '@/modules/user/services/user.service'

@Controller('bill')
@UseInterceptors(CryptInterceptor, BaseInterceptor)
export class BillController {
  constructor (
    private readonly walletService: WalletService,
    private readonly billService: BillService,
    private readonly billDetailService: BillDetailService,
    private readonly userService: UserService
  ) {}

  @Post('records')
  async queryPage (@Req() req: Request, @Body() param: BillRecordReq): Promise<BasePageResp<BillRecordItem>> {
    const result = await this.billService.queryPage(req.uid, param)
    const data = result.items.map(i => {
      return this.billService.transferDto(i)
    })
    return result.transfer(data)
  }

  @Post('detail')
  async billDetail (@Req() req: Request, @Body() param: BaseIdReq): Promise<BillDetailResp> {
    const bill = await this.billService.findById(param.id)
    const billDto = this.billService.transferDto(bill)
    const detail = await this.billDetailService.findOneByUIdAndBillId(req.uid, param.id)
    const result: BillDetailResp = {
      ...billDto,
      uid: detail.uid,
      from: detail.from,
      to: detail.to,
      transactionNo: detail.transactionNo,
      sellerNo: detail.sellerNo,
      remark: detail.remark
    }
    if (detail.businessType !== null && detail.businessId !== null) {
      result.businessType = detail.businessType
      result.businessId = detail.businessId
      if (detail.businessType === BusinessTypeEnum.USER) {
        const user = await this.userService.findById(detail.businessId)
        if (user !== null) {
          result.businessIcon = user.avatar
          result.businessLabel = user.name
        }
      }
    }
    return result
  }
}
