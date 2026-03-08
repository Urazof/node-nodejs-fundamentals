import { spawn } from 'child_process';

const execCommand = () => {
  // Get command from CLI arguments
  const args = process.argv.slice(2);
  const commandString = args[0];

  if (!commandString) {
    console.error('Error: Please provide a command to execute');
    console.log('Usage: node execCommand.js "command args"');
    process.exit(1);
  }

  // Parse command and arguments
  // For Windows, we need to use cmd /c to execute commands
  let command, commandArgs;

  if (process.platform === 'win32') {
    command = 'cmd';
    commandArgs = ['/c', commandString];
  } else {
    command = 'sh';
    commandArgs = ['-c', commandString];
  }

  // Spawn child process
  const child = spawn(command, commandArgs, {
    env: process.env,
    stdio: 'inherit' // This automatically pipes stdin/stdout/stderr
  });

  // Handle child process exit
  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error('Failed to execute command:', err.message);
    process.exit(1);
  });
};

execCommand();
