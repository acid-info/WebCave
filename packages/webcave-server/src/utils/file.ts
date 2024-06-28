import fs from 'fs';

class FileUtil {
  public static readFileSync(path: string): Buffer {
    return fs.readFileSync(path);
  }

  public static writeFileSync(path: string, content: string) {
    fs.writeFileSync(path, content)
  }
}

export default FileUtil;