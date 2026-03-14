import { createReadStream, createWriteStream } from 'fs';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createBrotliCompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compressDir = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const toCompressPath = join(workspacePath, 'toCompress');
  const compressedPath = join(workspacePath, 'compressed');
  const archivePath = join(compressedPath, 'archive.br');

  // Ensure output directory exists
  await mkdir(compressedPath, { recursive: true });

  // Collect all files with their relative paths
  const files = [];

  const scanDir = async (dirPath) => {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await scanDir(fullPath);
      } else if (stats.isFile()) {
        const relativePath = relative(toCompressPath, fullPath);
        files.push({ path: relativePath, fullPath: fullPath });
      }
    }
  };

  await scanDir(toCompressPath);

  // Create archive metadata in JSON format
  const archiveData = {
    files: files.map(f => ({ path: f.path }))
  };

  // Create a readable stream from the archive data
  async function* generateArchive() {
    // First, send metadata
    yield JSON.stringify(archiveData) + '\n---FILE_SEPARATOR---\n';

    // Then, send each file content with separator
    for (const file of files) {
      const content = await new Promise((resolve, reject) => {
        const chunks = [];
        const stream = createReadStream(file.fullPath);
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });

      yield content;
      yield '\n---FILE_SEPARATOR---\n';
    }
  }

  // Compress and write
  const brotliCompress = createBrotliCompress();
  const output = createWriteStream(archivePath);

  await pipeline(
    Readable.from(generateArchive()),
    brotliCompress,
    output
  );

  console.log(`Compressed ${files.length} file(s) to ${archivePath}`);
};

await compressDir();
