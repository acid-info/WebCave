export function pushQuad(v: number[], p1: number[], p2: number[], p3: number[], p4: number[]) {
  v.push( p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8] );
  v.push( p2[0], p2[1], p2[2], p2[3], p2[4], p2[5], p2[6], p2[7], p2[8] );
  v.push( p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8] );

  v.push( p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8] );
  v.push( p4[0], p4[1], p4[2], p4[3], p4[4], p4[5], p4[6], p4[7], p4[8] );
  v.push( p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8] );
}