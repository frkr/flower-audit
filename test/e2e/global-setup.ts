import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const WRANGLER = path.join(ROOT, 'node_modules/.bin/wrangler');

export const TEST_JWT_SECRET = 'e2e-test-jwt-secret-flower-audit';
export const TEST_USER = {
  sub: 'test-e2e-user',
  email: 'e2e@test.local',
  name: 'E2E Test User',
};

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function signTestJWT(): string {
  const header = b64urlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64urlEncode(
    Buffer.from(JSON.stringify({ ...TEST_USER, iat: now, exp: now + 86400 }))
  );
  const data = `${header}.${payload}`;
  const sig = b64urlEncode(
    crypto.createHmac('sha256', TEST_JWT_SECRET).update(data).digest()
  );
  return `${data}.${sig}`;
}

function wrangler(cmd: string) {
  execSync(`${WRANGLER} ${cmd}`, { cwd: ROOT, stdio: 'inherit' });
}

function wranglerSQL(sql: string) {
  const escaped = sql.replace(/"/g, '\\"');
  wrangler(`d1 execute flower-audit --local --command="${escaped}"`);
}

export default async function globalSetup() {
  // Initialize local D1 schema
  wrangler(`d1 execute flower-audit --local --file=schema.sql`);

  // Seed the jwt_secret used to sign test session tokens
  wranglerSQL(
    `INSERT OR REPLACE INTO settings (id, name, value, description) ` +
    `VALUES ('e2e-jwt-setting', 'jwt_secret', '${TEST_JWT_SECRET}', 'E2E test JWT secret')`
  );

  // Create Playwright auth storage state
  const token = signTestJWT();
  const authDir = path.join(ROOT, 'test/e2e/.auth');
  mkdirSync(authDir, { recursive: true });
  writeFileSync(
    path.join(authDir, 'user.json'),
    JSON.stringify({
      cookies: [
        {
          name: 'flower_session',
          value: encodeURIComponent(token),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
          expires: Math.floor(Date.now() / 1000) + 86400,
        },
      ],
      origins: [],
    })
  );
}
