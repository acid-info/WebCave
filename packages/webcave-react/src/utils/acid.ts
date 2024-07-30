export function getPerspectiveValues(isAcidTaken?: boolean): [number, number, number] {
  if (isAcidTaken) {
    return [71.5, 0.01, 200]
  } else {
    return [70, 0.01, 200]
  }
}