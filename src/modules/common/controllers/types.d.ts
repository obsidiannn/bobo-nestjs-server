
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
}
