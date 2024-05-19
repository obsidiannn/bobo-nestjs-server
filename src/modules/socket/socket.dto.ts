
export interface ISocketEvent {
  type: number
}

export interface SocketMessageEvent extends ISocketEvent {
  chatId: string
  msgId: string
  sequence: number
  date: Date
}
