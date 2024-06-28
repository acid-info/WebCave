import { Socket } from 'socket.io'

export function getIp(socket: Socket, isProxyUsed?: boolean): string {
  if (isProxyUsed) {
    // In case of X-Forwarded-For header being used
    const xForwardedFor = socket.handshake.headers["x-forwarded-for"];
    if (xForwardedFor) {
      if (Array.isArray(xForwardedFor)) {
        return xForwardedFor[0]
      } else {
        return xForwardedFor.split(',')[0]
      }
    }

    // In case of Forwarded header being used
    // FORMAT: Forwarded: by=<identifier>;for=<identifier>;host=<host>;proto=<http|https>
    const forwarderHeader = socket.handshake.headers["forwarded"] || ""
    for (const directive of forwarderHeader.split(",")[0].split(";")) {
      if (directive.startsWith("for=")) {
        return directive.substring(4);
      }
    }
  }

  return socket.handshake.address;
}

export function sanitiseInput(str: string): string {
  return (
    str
      .trim()
      .replace( /</g, "&lt;" )
      .replace( />/g, "&gt;" )
      .replace( /\\/g, "&quot" )
  )
}