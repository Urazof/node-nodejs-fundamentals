import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const findByExt = async () => {
  // Parse CLI argument
  const args = process.argv.slice(2);
  let extension = '.txt';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ext' && args[i + 1]) {
      extension = args[i + 1];
      if (!extension.startsWith('.')) {
        extension = '.' + extension;
      }
    }
  }

  const workspacePath = join(__dirname, '../../workspace');

  // Проверка существования workspace
  try {
    const stats = await stat(workspacePath);
    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }
  } catch (err) {
    throw new Error('FS operation failed');
  }

  const results = [];

  // Recursive search
  const searchDir = async (dirPath) => {
    try {
      const items = await readdir(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await searchDir(fullPath);
        } else if (stats.isFile() && fullPath.endsWith(extension)) {
          // Сохраняем относительный путь от workspace
          const relativePath = relative(workspacePath, fullPath).replace(/\\/g, '/');
          results.push(relativePath);
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  };

  await searchDir(workspacePath);

  results.forEach(file => console.log(file));
};

await findByExt();
