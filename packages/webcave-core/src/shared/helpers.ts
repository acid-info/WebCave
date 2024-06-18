// lineRectCollide( line, rect )
//
// Checks if an axis-aligned line and a bounding box overlap.
// line = { y, x1, x2 } or line = { x, y1, y2 }
// rect = { x, y, size }
import { Line, Rectangle, Square } from '../types/gl'

export function lineRectCollide(line: Line, rect: Square) {
  if (line.y)
    return rect.y > line.y - rect.size/2 && rect.y < line.y + rect.size/2 && rect.x > line.x1 - rect.size/2 && rect.x < line.x2 + rect.size/2;
  else
    return rect.x > line.x - rect.size/2 && rect.x < line.x + rect.size/2 && rect.y > line.y1 - rect.size/2 && rect.y < line.y2 + rect.size/2;
}

// rectRectCollide( r1, r2 )
//
// Checks if two rectangles (x1, y1, x2, y2) overlap.
export function rectRectCollide( r1: Rectangle, r2: Rectangle ) {
  if ( r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2 ) {
    return true;
  }
  if ( r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2 ) {
    return true;
  }
  if ( r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2 ) {
    return true;
  }
  if ( r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2 ) {
    return true;
  }


  return false;
}
