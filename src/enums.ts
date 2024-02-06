export enum AuthEnumIsRegister {
  NO = 0,
  YES = 1
}

export enum SysCategoryTypeEnum {
  APP = 1,
  GROUP = 2,
  USER = 3
}

export enum ActiveEnum {
  ACTIVE = 1,
  INACTIVE = 2
}

export enum GenderEnum {
  UNKNOWN = 0,
  MALE = 1,
  FAMALE = 2
}

export enum FriendApplyStatusEnum {
  PENDING = 0,
  PASSED = 1,
  REFUSED = 2
}

export enum GroupMemberStatus {
  PENDING = 0,
  NORMAL = 1
}

export enum GroupMemberRoleEnum {
  OWNER = 1,
  MANAGER = 2,
  MEMBER = 3
}

export enum UserGenderEnum {
  UNKNOWN = 0,
  MAN = 1,
  WOMEN = 2,
}

// 1-单聊 2-群聊 3 官方会话
export enum ChatTypeEnum {
  NORMAL = 1,
  GROUP = 2,
  OFFICIAL = 3
}
// 状态 1-正常 2-禁用
export enum ChatStatusEnum {
  ENABLE = 1,
  DISABLE = 2
}

export enum WalletTypeEnum {
  NORMAL = 1,
  SYSTEM = 2
}

export enum BillStatusEnum {
  SUCCESS = 1,
  NEED_PAY = 2,
  PENDING = 3,
  FAIL = 4
}

export enum BillInOutEnum {
  INCOME = 1, // 收入
  OUTCOME = 2 // 支出
}
// 账单类型 1-充值 2-提现 3-转账 4-红包 5-群收款 6-群退款 7-群提现 8-申请群付费
export enum BillTypeEnum {
  FILL_IN = 1,
  DRAW_CASH = 2,
  REMIT = 3,
  RED_PACKET = 4,
  GROUP_INCOME = 5,
  GROUP_REFUND = 6,
  GROUP_DRAW_CASH = 7,
  GROUP_JOIN_COST = 8,
}

export enum BusinessTypeEnum {
  USER = 1,
  GROUP = 2
}
