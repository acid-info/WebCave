import { AllKeysRequired, DynamicObject } from '../types/util'

export enum EChatActions {
  OPEN_CHAT = 'OPEN_CHAT'
}

export enum EKeyboardActions {
  MOVE_FORWARD = "MOVE_FORWARD",
  MOVE_BACKWARD = "MOVE_BACKWARD",
  MOVE_LEFT = "MOVE_LEFT",
  MOVE_RIGHT = "MOVE_RIGHT",
  JUMP = "JUMP"
}

export type EActions = EChatActions | EKeyboardActions;

export const ACTION_TO_KEYBOARD_KEY_MAP: DynamicObject<string, EActions, AllKeysRequired> = {
  [EChatActions.OPEN_CHAT]: "t",
  [EKeyboardActions.MOVE_FORWARD]: "w",
  [EKeyboardActions.MOVE_BACKWARD]: "s",
  [EKeyboardActions.MOVE_LEFT]: "a",
  [EKeyboardActions.MOVE_RIGHT]: "d",
  [EKeyboardActions.JUMP]: " ",
}