import fs from 'fs/promises';

async function setupDirectories() {
  const dirs = ['uploads', 'output'];
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir);
    }
  }
}

setupDirectories().catch(console.error);