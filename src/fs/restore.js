import { readFile, writeFile, mkdir, stat, access } from 'fs/promises';
import { join, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const restore = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const snapshotPath = join(workspacePath, 'snapshot.json');
  const restorePath = join(__dirname, '../../workspace_restored');

  // Проверка существования snapshot.json
  try {
    await stat(snapshotPath);
  } catch (err) {
    throw new Error('FS operation failed');
  }

  // Проверка, что workspace_restored еще не существует
  try {
    await stat(restorePath);
    throw new Error('FS operation failed');
  } catch (err) {
    if (err.message === 'FS operation failed') throw err;
    // Директория не существует - это хорошо, продолжаем
  }

  const snapshotData = await readFile(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(snapshotData);

  await mkdir(restorePath, { recursive: true });

  for (const entry of snapshot.entries) {
    const targetPath = join(restorePath, entry.path);

    if (entry.type === 'directory') {
      await mkdir(targetPath, { recursive: true });
    } else if (entry.type === 'file') {
      const parentDir = pathDirname(targetPath);
      await mkdir(parentDir, { recursive: true });

      const content = Buffer.from(entry.content, 'base64');
      await writeFile(targetPath, content);
    }
  }

  console.log(`Restored ${snapshot.entries.length} entries to ${restorePath}`);
};

await restore();
