import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const WRANGLER = path.join(ROOT, 'node_modules/.bin/wrangler');

function wranglerSQL(sql: string) {
  const escaped = sql.replace(/"/g, '\\"');
  try {
    execSync(`${WRANGLER} d1 execute flower-audit --local --command="${escaped}"`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    // ignore teardown errors
  }
}

export default async function globalTeardown() {
  // Remove test jwt_secret from local DB
  wranglerSQL(`DELETE FROM settings WHERE id = 'e2e-jwt-setting'`);
}
