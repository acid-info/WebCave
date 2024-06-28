export function normaliseAngle(ang: number) {
  const newAng = ang % (Math.PI*2);

  if (newAng < 0) {
    return Math.PI*2 + ang;
  }

  return newAng;
}