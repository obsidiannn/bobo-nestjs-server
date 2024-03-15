
declare namespace ISystemController {
  interface GetPubKeyResponse {
    pubKey: string | undefined
  }
  interface GetStaticUrlResponse {
    staticUrl: string | undefined
  }
  interface GetNodesResponse {
    nodes: string[] | undefined
  }

  interface SysInfoResponse {
    pubKey?: string
    staticUrl?: string
  }

}

declare namespace IFileController{
  interface PreSignRequest {
    key: string

  }
  interface PreSignResponse {
    result: string

  }

}
