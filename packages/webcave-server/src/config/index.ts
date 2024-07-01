import dotenv from "dotenv";
import { AppConfig } from "./types.ts";

dotenv.config();

const {
  MAX_PLAYERS,
  WORLD_SX,
  WORLD_SY,
  WORLD_SZ,
  WORLD_GROUNDHEIGHT,
  SECONDS_BETWEEN_SAVES,
  ADMIN_IP,
  ONE_USER_PER_IP,
  IS_BEHIND_PROXY,
  WORLD_FILE_NAME,
  CLIENT_ORIGIN_URL
} = process.env;

if (!WORLD_SX || !WORLD_SY || !WORLD_SZ || !WORLD_GROUNDHEIGHT) {
  throw new Error("Please provide all 'World' related parameters in the environment configuration");
}
if (!SECONDS_BETWEEN_SAVES || !ONE_USER_PER_IP) {
  throw new Error("Please provide all 'Server' related parameters in the environment configuration'");
}
if (!MAX_PLAYERS) {
  throw new Error("Please provide the maximum number of players");
}
if (!WORLD_FILE_NAME) {
  throw new Error("Please provide file name for saving the world");
}
if (!CLIENT_ORIGIN_URL) {
  throw new Error("Please provide client origin URL for the CORS policy")
}

const Config: AppConfig = {
  MAX_PLAYERS: parseInt(MAX_PLAYERS),
  WORLD_SX: parseInt(WORLD_SX),
  WORLD_SY: parseInt(WORLD_SY),
  WORLD_SZ: parseInt(WORLD_SZ),
  WORLD_GROUNDHEIGHT: parseInt(WORLD_GROUNDHEIGHT),
  SECONDS_BETWEEN_SAVES: parseInt(SECONDS_BETWEEN_SAVES),
  ADMIN_IP,
  ONE_USER_PER_IP: ONE_USER_PER_IP === "true",
  IS_BEHIND_PROXY: IS_BEHIND_PROXY === "true",
  WORLD_FILE_NAME,
  CORS_POLICY: {  credentials: true,
    origin: CLIENT_ORIGIN_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  }
}

export default Config;