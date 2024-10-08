import { CorsOptions } from 'cors'

export type AppConfig = {
  PORT: number
  MAX_PLAYERS: number
  WORLD_SX: number
  WORLD_SY: number
  WORLD_SZ: number
  WORLD_GROUNDHEIGHT: number
  SECONDS_BETWEEN_SAVES: number
  ADMIN_IP: string
  ONE_USER_PER_IP: boolean
  IS_BEHIND_PROXY: boolean
  WORLD_FILE_NAME: string
  WORLD_FILE_FOLDER: string
  CORS_POLICY: CorsOptions
  USE_FALLBACK_DEFAULT_WORLD: boolean
}