import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { access } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dynamic = async () => {
  const args = process.argv.slice(2);
  const pluginName = args[0];

  if (!pluginName) {
    console.error('Error: Please provide a plugin name');
    console.log('Usage: node dynamic.js <plugin-name>');
    return;
  }

  try {
    const pluginPath = join(__dirname, 'plugins', `${pluginName}.js`);

    // Check if file exists first
    try {
      await access(pluginPath);
    } catch {
      console.log('Plugin not found');
      process.exit(1);
    }

    const pluginUrl = pathToFileURL(pluginPath).href;
    const plugin = await import(pluginUrl);

    if (typeof plugin.run !== 'function') {
      console.error(`Error: Plugin ${pluginName} does not export a run() function`);
      return;
    }

    const result = plugin.run();
    console.log(result);
  } catch (err) {
    console.error(`Error loading plugin: ${err.message}`);
    process.exit(1);
  }
};

await dynamic();

