import * as readline from 'readline';
import { stdin, stdout, uptime, cwd } from 'process';

const interactive = () => {
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
    console.log('\nReceived SIGINT. Type "exit" to quit.');
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
};

interactive();
