import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const merge = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const partsPath = join(workspacePath, 'parts');
  const mergedPath = join(workspacePath, 'merged.txt');

  // Проверка существования папки parts
  try {
    await stat(partsPath);
  } catch (err) {
    throw new Error('FS operation failed');
  }

  // Parse CLI arguments
  const args = process.argv.slice(2);
  let filesList = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--files' && args[i + 1]) {
      filesList = args[i + 1].split(',').map(f => f.trim());
    }
  }

  let files;

  if (filesList) {
    // Use provided order
    files = filesList;

    // Проверка существования всех запрошенных файлов
    for (const file of files) {
      try {
        await stat(join(partsPath, file));
      } catch (err) {
        throw new Error('FS operation failed');
      }
    }
  } else {
    // Read all .txt files in alphabetical order
    const allFiles = await readdir(partsPath);
    files = allFiles
      .filter(f => f.endsWith('.txt'))
      .sort();

    // Проверка, что найдены .txt файлы
    if (files.length === 0) {
      throw new Error('FS operation failed');
    }
  }

  // Read and merge content
  const contents = [];
  for (const file of files) {
    const filePath = join(partsPath, file);
    const content = await readFile(filePath, 'utf-8');
    contents.push(content);
  }

  // Write merged content
  const merged = contents.join('\n');
  await writeFile(mergedPath, merged);

  console.log(`Merged ${files.length} files into ${mergedPath}`);
};

await merge();
