import * as readline from 'readline';
import { stdin, stdout, uptime, cwd } from 'process';

const interactive = () => {
  let closing = false;

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
    prompt: '> '
  });

  console.log('Interactive CLI started. Available commands: uptime, cwd, date, exit');
  rl.prompt();

  rl.on('line', (line) => {
    const command = line.trim();

    switch (command) {
      case 'uptime':
        const uptimeSeconds = uptime();
        console.log(`Uptime: ${uptimeSeconds.toFixed(2)} seconds`);
        break;

      case 'cwd':
        console.log(`Current directory: ${cwd()}`);
        break;

      case 'date':
        console.log(`Current date: ${new Date().toISOString()}`);
        break;

      case 'exit':
        closing = true;
        console.log('Goodbye!');
        rl.close();
        return;

      default:
        console.log(`Unknown command: ${command}`);
        break;
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    closing = true;
    rl.close();
  });

  rl.on('close', () => {
    if (!closing) {
      console.log('Goodbye!');
    }
    process.exit(0);
  });
};

interactive();
