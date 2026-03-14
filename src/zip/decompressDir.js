import { createReadStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createBrotliDecompress } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const decompressDir = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const compressedPath = join(workspacePath, 'compressed');
  const archivePath = join(compressedPath, 'archive.br');
  const decompressedPath = join(workspacePath, 'decompressed');

  // Ensure output directory exists
  await mkdir(decompressedPath, { recursive: true });

  // Decompress the archive
  const brotliDecompress = createBrotliDecompress();
  const input = createReadStream(archivePath);

  const chunks = [];

  await new Promise((resolve, reject) => {
    input
      .pipe(brotliDecompress)
      .on('data', chunk => chunks.push(chunk))
      .on('end', resolve)
      .on('error', reject);
  });

  const decompressedData = Buffer.concat(chunks).toString('utf-8');

  // Split by separator
  const parts = decompressedData.split('\n---FILE_SEPARATOR---\n');

  // First part is metadata
  const metadata = JSON.parse(parts[0]);

  // Rest are file contents
  const fileContents = parts.slice(1, -1); // Remove last empty element

  // Extract files
  for (let i = 0; i < metadata.files.length; i++) {
    const fileInfo = metadata.files[i];
    const content = fileContents[i];
    const targetPath = join(decompressedPath, fileInfo.path);

    // Ensure parent directory exists
    const parentDir = pathDirname(targetPath);
    await mkdir(parentDir, { recursive: true });

    // Write file
    await writeFile(targetPath, content);
  }

  console.log(`Decompressed ${metadata.files.length} file(s) to ${decompressedPath}`);
};

await decompressDir();
