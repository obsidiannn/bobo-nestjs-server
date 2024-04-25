import { ConfigService } from '@nestjs/config'
import { cert, App, Credential } from 'firebase-admin/app'
import admin from 'firebase-admin'
import { BatchResponse, Message, MulticastMessage, getMessaging } from 'firebase-admin/messaging'

import { HttpsProxyAgent } from 'https-proxy-agent'
import { PropConstant } from '@/enums'
import { Injectable } from '@nestjs/common'
import * as path from 'path'
import * as process from 'process'
@Injectable()
export class FirebaseService {
  constructor (private readonly configService: ConfigService) {
    this.initFirebase()
  }

  private firebaseApp: App

  // 初始化 firebase
  private initFirebase (): void {
    const httpProxy = this.configService.get<string>(PropConstant.HTTP_PROXY)
    const agent = (httpProxy !== undefined && httpProxy !== '') ? new HttpsProxyAgent(httpProxy) : undefined

    const config: Credential = cert(path.join(process.cwd(), 'firebase-adminsdk.json'), agent)
    this.firebaseApp = admin.initializeApp({
      credential: config,
      httpAgent: agent
    })
  }

  /**
   * 发送主题消息
   * @returns messageId
   */
  async sendTopicMessage (topicName: string, message: Message): Promise<string> {
    message = {
      ...message,
      topic: topicName
    }
    return await getMessaging().send(message)
  }

  /**
   * 发送单个消息
   * @param token 设备注册token
   * @returns
   */
  async sendDeviceMessage (token: string, message: Message): Promise<string> {
    message = {
      ...message,
      token
    }
    return await getMessaging(this.firebaseApp).send(message)
  }

  /**
   * 发送批量消息
   * @param registrationTokens
   */
  async sendBatchMessage (tokens: string[], message: MulticastMessage): Promise<BatchResponse> {
    message = {
      ...message,
      tokens
    }
    return await getMessaging().sendEachForMulticast(message)
  }
}
