import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const restore = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const snapshotPath = join(workspacePath, 'snapshot.json');
  const restorePath = join(__dirname, '../../workspace_restored');

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
