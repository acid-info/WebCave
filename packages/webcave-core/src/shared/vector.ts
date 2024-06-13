class Vector {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public add(vec: Vector) {
    return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z)
  }

  public sub(vec: Vector) {
    return new Vector( this.x - vec.x, this.y - vec.y, this.z - vec.z );
  }

  public mul(n: number) {
    return new Vector( this.x * n, this.y * n, this.z * n );
  }

  public length() {
    return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
  }

  public distance(vec: Vector)
  {
    return this.sub(vec).length();
  }

  public normal() {
    if ( this.x == 0 && this.y == 0 && this.z == 0 ) {
      return new Vector( 0, 0, 0 );
    }

    let l = this.length();
    return (
      new Vector( this.x / l, this.y / l, this.z / l )
    );
  }

  public dot(vec: Vector) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z;
  }

  public toArray() {
    return [ this.x, this.y, this.z ];
  }

  public toString() {
    return "( " + this.x + ", " + this.y + ", " + this.z + " )";
  }
}

export default Vector