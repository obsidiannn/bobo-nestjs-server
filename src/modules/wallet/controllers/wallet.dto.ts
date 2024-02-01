import { BillInOutEnum, BillTypeEnum } from '@/enums'
import { BasePageReq } from '@/modules/common/dto/common.dto'

export class WalletDetailResp {
  balance: number
  currency: number
  type: number
}

export class BillRecordReq extends BasePageReq {
  inOut: BillInOutEnum
  type: BillTypeEnum
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
  businessId?: string
  businessType?: string
  businessIcon?: string
  businessLabel?: string
  remark: string | null
  transactionNo: string | null
  sellerNo: string | null
}
