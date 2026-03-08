import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const split = async () => {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let maxLines = 10;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lines' && args[i + 1]) {
      maxLines = parseInt(args[i + 1], 10);
    }
  }

  const workspacePath = join(__dirname, '../../workspace');
  const sourcePath = join(workspacePath, 'source.txt');

  let currentChunk = 1;
  let currentLines = 0;
  let currentStream = createWriteStream(join(workspacePath, `chunk_${currentChunk}.txt`));
  let buffer = '';

  const splitter = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');

      // Keep the last incomplete line in buffer
      buffer = lines.pop();

      for (const line of lines) {
        if (currentLines >= maxLines) {
          currentStream.end();
          currentChunk++;
          currentLines = 0;
          currentStream = createWriteStream(join(workspacePath, `chunk_${currentChunk}.txt`));
        }

        currentStream.write(line + '\n');
        currentLines++;
      }

      callback();
    },

    flush(callback) {
      // Process remaining buffer
      if (buffer.length > 0) {
        if (currentLines >= maxLines) {
          currentStream.end();
          currentChunk++;
          currentStream = createWriteStream(join(workspacePath, `chunk_${currentChunk}.txt`));
        }
        currentStream.write(buffer + '\n');
      }
      currentStream.end();
      callback();
    }
  });

  try {
    await pipeline(
      createReadStream(sourcePath),
      splitter
    );

    console.log(`Split complete. Created ${currentChunk} chunk(s)`);
  } catch (err) {
    console.error('Error splitting file:', err.message);
  }
};

await split();
