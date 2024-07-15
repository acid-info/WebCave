import { Vector, World } from '@acid-info/webcave-core'
import FileUtil from '../utils/file'
import path from 'node:path'
import logger from '../utils/logger'

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

      const [spawnX, spawnY, spawnZ] = data.split(',');
      this.createFromString(data);
      this.spawnPoint = new Vector(
        parseInt(spawnX),
        parseInt(spawnY),
        parseInt(spawnZ)
      );

      return true;
    } catch ( e ) {
      logger.error(e)
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