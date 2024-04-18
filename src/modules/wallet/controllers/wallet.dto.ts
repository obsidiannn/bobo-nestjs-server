import { BillInOutEnum, BillTypeEnum } from '@/enums'
import { BasePageReq } from '@/modules/common/dto/common.dto'
import { IsNotEmpty } from 'class-validator'

export class WalletDetailResp {
  balance: number
  currency: number
  type: number
}

export interface BillRecordReq extends BasePageReq {
  inOut?: number
  types?: number[]
}

export class BillRecordItem {
  id: string
  type: number
  inOut: number
  amount: number
  status: number
  createdAt: Date
}

export class BillDetailResp extends BillRecordItem {
  uid: string
  from: string
  to: string
  businessId?: string | null
  businessType?: number | null
  businessIcon?: string | null
  businessLabel?: string | null
  remark: string | null
  transactionNo: string | null
  sellerNo: string | null
}

export class WalletCardFillReq {
  cardNo: string
}

export class WalletRemitReq {
  id: string
  @IsNotEmpty({ message: 'error' })
    objUId: string

  amount: number
  remark?: string
}

export class WalletRemitResp {
  billId: string
  transactionNo: string
}
