import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UserService } from '../user/services/user.service'
import { AuthService } from '../auth/services/auth.service'
import { hashMessage } from 'ethers'
import { UserInfoItem } from '../user/controllers/user.dto'
import { ParsedUrlQuery } from 'querystring'
import { ISocketEvent } from './socket.dto'
const Topic: string = 'events'
@WebSocketGateway({
  transports: ['websocket', 'polling', Topic],
  cors: {
    origin: '*'
  }
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // k-clientId,v-client
  private readonly connectedClients = new Map<string, Socket>()
  // k-userId,v-clientId[]
  private readonly userClientHash = new Map<string, Set<string>>()
  // k-clientId,v-userId
  private readonly clientUserHash = new Map<string, string>()
  constructor (
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
  }

  @WebSocketServer()
    server: Server

  // 监听
  @SubscribeMessage('events')
  async handleEvent (@MessageBody() data: string, @ConnectedSocket() client: Socket): Promise<any> {
    console.log('ws req:' + data.toString())
    return data
  }

  // 首次连接调用
  async handleConnection (client: Socket, ...args: any[]): Promise<void> {
    console.log('client init ' + client.id)
    console.log(client.handshake.query)
    try {
      const user = await this.checkConnection(client.handshake.query)
      if (user !== null) {
        console.log('====================================')
        console.log('headers', client.handshake.headers)
        console.log('[socket]连接成功： clientID: [' + client.id + '] userId: [' + user.id + ']')
        console.log('====================================')
        this.putClient(client, user.id)
      } else {
        console.log('鉴权失败')
        client.disconnect()
      }
    } catch (e) {
      client.disconnect()
    }
  }

  // 离线调用
  handleDisconnect (client: Socket): any {
    console.log('====================================')
    console.log(client.id + ' [socket] 离线')
    console.log('====================================')
    this.clearClient(client)
    client.disconnect()
  }

  /**
   * 服务端主动发送消息给client
   */
  sendMessage (uid: string, data: ISocketEvent): boolean {
    console.log('[socket] send begin ', uid, data)
    console.log(this.userClientHash)
    const clients = this.getClientByUid(uid)
    if (clients.length > 0) {
      let count = 0
      clients.forEach(c => {
        console.log('[socket] send ', data)
        c.emit('message', data)
        count++
      })
      return count > 0
    }
    return false
  }

  sendBatchMessage (uids: string[], data: ISocketEvent): string[] {
    const failedIds: string[] = []
    uids.forEach(u => {
      const result = this.sendMessage(u, data)
      if (!result) {
        failedIds.push(u)
      }
    })
    return failedIds
  }

  // 鉴权
  private async checkConnection (param: ParsedUrlQuery): Promise<UserInfoItem | null> {
    const sign = (param['X-Sign'] ?? '') as string
    const time = (param['X-Time'] ?? '') as string
    if (sign === '' || time === '') {
      return null
    }
    const dataHash = (param['X-Data-Hash'] ?? '') as string
    if (dataHash === '') {
      return null
    }
    const uid = this.authService.recoverUid(hashMessage(dataHash + ':' + time), sign)
    const user = await this.userService.checkById(uid)
    if (user !== null) {
      return user
    }
    return null
  }

  // 新加入的client
  private putClient (client: Socket, uid: string): void {
    this.connectedClients.set(client.id, client)
    const clientIds = (this.userClientHash.get(uid) ?? new Set())
    this.userClientHash.set(uid, clientIds.add(client.id))
    this.clientUserHash.set(client.id, uid)
  }

  // client 关系移除
  private clearClient (client: Socket): void {
    this.connectedClients.delete(client.id)
    const uid = this.clientUserHash.get(client.id)
    if (uid !== undefined && uid !== null) {
      this.clientUserHash.delete(client.id)
      const clientIds = (this.userClientHash.get(uid) ?? new Set())
      if (clientIds.delete(client.id)) {
        this.userClientHash.set(uid, clientIds)
      }
    }
  }

  private getClientByUid (uid: string): Socket[] {
    const clientIds = this.userClientHash.get(uid)
    if (clientIds !== undefined && clientIds !== null) {
      const result: Socket[] = []
      Array.from(clientIds.values()).forEach(clientId => {
        const client = this.connectedClients.get(clientId) ?? null
        if (client !== null) {
          result.push(client)
        }
      })
      return result
    }
    return []
  }
}
