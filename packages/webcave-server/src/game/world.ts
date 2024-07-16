import { Vector, World } from '@acid-info/webcave-core'
import FileUtil from '../utils/file'
import path from 'node:path'

class ServerWorld extends World {
  public readonly worldSaveFileName: string;
  public readonly worldSaveDirName: string;

  constructor(sx: number, sy: number, sz: number, filename: string, dir: string) {
    super(sx, sy, sz)

    this.worldSaveDirName = dir;
    this.worldSaveFileName = filename;
  }

  public getWorldFilePath() {
    return path.join(process.cwd(), this.worldSaveDirName, this.worldSaveFileName);
  }

  public prepareNewSaveDir() {
    const dir = path.join(process.cwd(), this.worldSaveDirName);

    if (!FileUtil.directoryExists(dir)) {
      FileUtil.createDirectory(dir)
    }
  }

  public loadFromFile() {
    try {
      const path = this.getWorldFilePath();
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
      return false;
    }
  }

  public saveToFile() {
    const data = this.spawnPoint.x + "," + this.spawnPoint.y + "," + this.spawnPoint.z + "," + this.toNetworkString();

    const path = this.getWorldFilePath();
    FileUtil.writeFileSync( path, data );
  }
}

export default ServerWorld;