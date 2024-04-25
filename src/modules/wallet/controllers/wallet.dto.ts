import { BillInOutEnum, BillTypeEnum } from '@/enums'
import { BasePageReq, BasePageResp } from '@/modules/common/dto/common.dto'
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

export class WalletRecordPageResp<T> extends BasePageResp<T> {
  incomeTotal: number
  outcomeTotal: number
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

export interface WalletRemitReq {
  id: string
  objUId: string
  amount: number
  remark?: string
  chatId: string
  content: string

}

export class WalletRemitResp {
  billId: string
  transactionNo: string
  sequence: number
  id?: string
  fromUid: string
  remark: string
  amount: number
  time: Date
  content?: string
}
