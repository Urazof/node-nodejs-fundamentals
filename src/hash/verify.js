import { readFile, createReadStream } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const readFileAsync = promisify(readFile);

const verify = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const checksumsPath = join(workspacePath, 'checksums.json');

  // Read checksums file
  const checksumsData = await readFileAsync(checksumsPath, 'utf-8');
  const checksums = JSON.parse(checksumsData);

  // Verify each file
  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = join(workspacePath, filename);

    try {
      // Calculate hash using streams
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);

      await new Promise((resolve, reject) => {
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const calculatedHash = hash.digest('hex');
      const status = calculatedHash === expectedHash ? 'OK' : 'FAIL';
      console.log(`${filename} — ${status}`);
    } catch (err) {
      console.log(`${filename} — FAIL (file not found)`);
    }
  }
};

await verify();
