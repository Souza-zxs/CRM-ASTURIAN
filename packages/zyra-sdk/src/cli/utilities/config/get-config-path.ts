import * as os from 'os';
import * as path from 'path';

const ZYRA_DIR = path.join(os.homedir(), '.zyra');

export const getConfigPath = (test = false): string => {
  if (test || process.env.NODE_ENV === 'test') {
    return path.join(ZYRA_DIR, 'config.test.json');
  }

  return path.join(ZYRA_DIR, 'config.json');
};
