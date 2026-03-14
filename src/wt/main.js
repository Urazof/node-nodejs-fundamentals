import { Worker } from 'worker_threads';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { cpus } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async () => {
  const workspacePath = join(__dirname, '../../workspace');
  const dataPath = join(workspacePath, 'data.json');

  // Read data
  const dataContent = await readFile(dataPath, 'utf-8');
  const numbers = JSON.parse(dataContent);

  // Determine number of workers (CPU cores)
  const numWorkers = cpus().length;

  // Split data into chunks
  const chunkSize = Math.ceil(numbers.length / numWorkers);
  const chunks = [];

  for (let i = 0; i < numWorkers; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, numbers.length);
    if (start < numbers.length) {
      chunks.push(numbers.slice(start, end));
    }
  }

  // Create workers and collect sorted chunks
  const workerPath = join(__dirname, 'worker.js');

  const workerPromises = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath);

      worker.on('message', (sortedChunk) => {
        resolve(sortedChunk);
        worker.terminate();
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });

      worker.postMessage(chunk);
    });
  });

  const results = await Promise.all(workerPromises);

  // K-way merge algorithm
  const merge = (arrays) => {
    const result = [];
    const pointers = new Array(arrays.length).fill(0);

    while (true) {
      let minValue = Infinity;
      let minIndex = -1;

      // Find minimum value among current elements
      for (let i = 0; i < arrays.length; i++) {
        if (pointers[i] < arrays[i].length) {
          if (arrays[i][pointers[i]] < minValue) {
            minValue = arrays[i][pointers[i]];
            minIndex = i;
          }
        }
      }

      // If no more elements, break
      if (minIndex === -1) break;

      // Add minimum to result and move pointer
      result.push(minValue);
      pointers[minIndex]++;
    }

    return result;
  };

  const finalSorted = merge(results);

  console.log('Sorted array:', finalSorted);
  console.log('Total elements:', finalSorted.length);
};

await main();
