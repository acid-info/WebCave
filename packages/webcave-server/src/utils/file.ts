import fs from 'fs';

class FileUtil {
  public static readFileSync(path: string): Buffer {
    return fs.readFileSync(path);
  }

  public static writeFileSync(path: string, content: string) {
    fs.writeFileSync(path, content)
  }

  public static directoryExists(path: string) {
    return fs.existsSync(path);
  }

  public static createDirectory(path: string) {
    fs.mkdirSync(path)
  }
}

export default FileUtil;