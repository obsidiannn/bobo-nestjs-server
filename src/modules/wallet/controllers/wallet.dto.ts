import { BillInOutEnum, BillTypeEnum } from '@/enums'
import { BasePageReq } from '@/modules/common/dto/common.dto'

export class WalletDetailResp {
  balance: number
  currency: number
  type: number
}

export class BillRecordReq extends BasePageReq {
  inOut?: BillInOutEnum
  type?: BillTypeEnum
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
