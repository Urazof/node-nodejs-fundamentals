import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const merge = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const partsPath = join(workspacePath, 'parts');
  const mergedPath = join(workspacePath, 'merged.txt');

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
  } else {
    // Read all .txt files in alphabetical order
    const allFiles = await readdir(partsPath);
    files = allFiles
      .filter(f => f.endsWith('.txt'))
      .sort();
  }

  // Read and merge content
  const contents = [];
  for (const file of files) {
    try {
      const filePath = join(partsPath, file);
      const content = await readFile(filePath, 'utf-8');
      contents.push(content);
    } catch (err) {
      console.error(`Warning: Could not read ${file}`);
    }
  }

  // Write merged content
  const merged = contents.join('\n');
  await writeFile(mergedPath, merged);

  console.log(`Merged ${files.length} files into ${mergedPath}`);
};

await merge();
