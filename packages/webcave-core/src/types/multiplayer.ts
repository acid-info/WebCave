import { EMaterial } from './material'

export type SocketClientEvents =
  // Networked block update
  // C -> S
  "setblock" |

  // Send a chat message
  // C -> S
  "chat" |

  // Send player position and orientation to the server
  // C -> S
  "player" |

  // On connect, authenticate and propagate nickname
  // C -> S
  "nickname" |

  // Broadcast message
  // C -> S
  "msg";

export type SocketServerEvents =
  // Kick a client with specified message
  // C <- S
  "kick" |

  // Request client to set their position
  // C <- S
  "setpos" |

  // Send world to client
  // C <- S
  "world" |

  // Spawn new (local) player
  // C <- S
  "spawn" |

  // Tell client about other players
  // C <- S
  "join" |

  // Tell client a player left
  // C <- S
  "leave" |

  // Broadcast message
  // C <- S
  "msg" |

  // Networked block update
  // C <- S
  "setblock"

export type SocketEvents = SocketClientEvents | SocketServerEvents;

export type PayloadBySocketEvent<E> =
  E extends "setblock" ? SetBlockPayload :
  E extends "chat" ? ChatPayload :
  E extends "player" ? UpdatePlayerPositionPayload :
  E extends "nickname" ? NicknamePayload :
  E extends "msg" ? MessagePayload :
  E extends "kick" ? KickPayload :
  E extends "setpos" ? SetPositionPayload :
  E extends "world" ? WorldPayload :
  E extends "spawn" ? SpawnPayload :
  E extends "join" ? JoinPayload :
  E extends "leave" ? LeavePayload :
  never;

export type SocketEmitterPayloadMap<E extends string | number | symbol = SocketEvents> = {
  [K in E]: (p: PayloadBySocketEvent<K>) => void;
}

type SetBlockPayload = {
  x: number;
  y: number;
  z: number;
  mat: EMaterial;
}

type ChatPayload = {
  msg: string;
}

type UpdatePlayerPositionPayload = {
  nick?: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
}

type NicknamePayload = {
  nickname: string;
}

type MessagePayload = {
  type: "generic" | "chat";
  user?: string;
  msg: string;
}

type KickPayload = {
  msg: string;
}

type SetPositionPayload = {
  x: number;
  y: number;
  z: number;
}

type WorldPayload = {
  sx: number;
  sy: number;
  sz: number;
  blocks: string;
}

type SpawnPayload = {
  x: number;
  y: number;
  z: number;
}

type JoinPayload = {
  nick: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
}

type LeavePayload = {
  nick: string;
}