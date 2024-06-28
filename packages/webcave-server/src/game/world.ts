import { Vector, World } from '@acid-info/webcave-core/src'
import FileUtil from '../utils/file.ts'
import path from 'node:path'

class ServerWorld extends World {
  constructor(sx: number, sy: number, sz: number) {
    super(sx, sy, sz)
  }

  public getWorldFilePath(filename: string) {
    return path.join(process.cwd(), filename);
  }

  public loadFromFile(filename: string) {
    try {
      const path = this.getWorldFilePath(filename);
      const data = FileUtil.readFileSync(path).toString('utf8');

      const [, , , world] = data.split(',');
      this.createFromString(world);
      this.spawnPoint = new Vector(
        parseInt(data[0]),
        parseInt(data[1]),
        parseInt(data[2])
      );

      return true;
    } catch ( e ) {
      return false;
    }
  }

  public saveToFile(filename: string) {
    const data = this.spawnPoint.x + "," + this.spawnPoint.y + "," + this.spawnPoint.z + "," + this.toNetworkString();

    const path = this.getWorldFilePath(filename);
    FileUtil.writeFileSync( path, data );
  }
}

export default ServerWorld;