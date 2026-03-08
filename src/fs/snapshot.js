import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const snapshot = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const snapshotPath = join(workspacePath, 'snapshot.json');

  const entries = [];

  const scanDir = async (dirPath, basePath) => {
    try {
      const items = await readdir(dirPath);

      for (const item of items) {
        const fullPath = join(dirPath, item);
        const relativePath = relative(basePath, fullPath);

        if (relativePath === 'snapshot.json') continue;

        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          entries.push({
            path: relativePath,
            type: 'directory'
          });
          await scanDir(fullPath, basePath);
        } else if (stats.isFile()) {
          const content = await readFile(fullPath);
          entries.push({
            path: relativePath,
            type: 'file',
            size: stats.size,
            content: content.toString('base64')
          });
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  };

  await scanDir(workspacePath, workspacePath);

  const snapshot = {
    rootPath: workspacePath,
    entries: entries
  };

  await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
  console.log(`Snapshot created at ${snapshotPath}`);
  console.log(`Total entries: ${entries.length}`);
};

await snapshot();
