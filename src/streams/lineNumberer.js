import { Transform } from 'stream';
import { stdin, stdout } from 'process';

const lineNumberer = () => {
  let lineNumber = 0;
  let buffer = '';

  const lineNumberTransform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');

      // Keep the last incomplete line in buffer
      buffer = lines.pop();

      for (const line of lines) {
        lineNumber++;
        this.push(`${lineNumber}: ${line}\n`);
      }

      callback();
    },

    flush(callback) {
      // Process remaining buffer
      if (buffer.length > 0) {
        lineNumber++;
        this.push(`${lineNumber}: ${buffer}\n`);
      }
      callback();
    }
  });

  stdin.pipe(lineNumberTransform).pipe(stdout);
};

lineNumberer();
