import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dynamic = async () => {
  // Get plugin name from CLI arguments
  const args = process.argv.slice(2);
  const pluginName = args[0];

  if (!pluginName) {
    console.error('Error: Please provide a plugin name');
    console.log('Usage: node dynamic.js <plugin-name>');
    return;
  }

  try {
    // Dynamically import plugin
    const pluginPath = join(__dirname, 'plugins', `${pluginName}.js`);
    const plugin = await import(pluginPath);

    // Check if run function exists
    if (typeof plugin.run !== 'function') {
      console.error(`Error: Plugin ${pluginName} does not export a run() function`);
      return;
    }

    // Execute plugin
    const result = plugin.run();
    console.log(result);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'ENOENT') {
      console.error(`Error: Plugin ${pluginName} not found`);
    } else {
      console.error(`Error loading plugin: ${err.message}`);
    }
  }
};

await dynamic();
