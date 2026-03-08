import { Transform } from 'stream';
import { stdin, stdout } from 'process';

const filter = () => {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let pattern = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pattern' && args[i + 1]) {
      pattern = args[i + 1];
    }
  }

  if (!pattern) {
    console.error('Error: --pattern argument is required');
    process.exit(1);
  }

  let buffer = '';

  const filterTransform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');

      // Keep the last incomplete line in buffer
      buffer = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + '\n');
        }
      }

      callback();
    },

    flush(callback) {
      // Process remaining buffer
      if (buffer.length > 0 && buffer.includes(pattern)) {
        this.push(buffer + '\n');
      }
      callback();
    }
  });

  stdin.pipe(filterTransform).pipe(stdout);
};

filter();
