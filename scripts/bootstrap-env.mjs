import {
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  renameSync,
} from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const REQUIRED_VARIABLES = ['DATABASE_URL', 'JWT_SECRET'];
const JWT_SECRET_MIN_LENGTH = 32;
const JWT_SECRET_PLACEHOLDER = 'replace-with-at-least-32-random-characters';

function error(message) {
  console.error(`[bootstrap-env] ERROR: ${message}`);
  process.exitCode = 1;
  process.exit(1);
}

function validateExample(content) {
  if (!content.includes('DATABASE_URL=')) {
    error('.env.example is missing DATABASE_URL.');
  }

  const jwtSecretMatches = content.match(/^JWT_SECRET=.*$/gm);
  if (!jwtSecretMatches) {
    error('.env.example is missing JWT_SECRET.');
  }

  if (jwtSecretMatches.length > 1) {
    error('.env.example contains multiple JWT_SECRET entries.');
  }

  const databaseUrlLine = content
    .split('\n')
    .find((line) => line.startsWith('DATABASE_URL='));
  if (!databaseUrlLine || databaseUrlLine.split('=')[1]?.trim() === '') {
    error('.env.example contains an empty DATABASE_URL.');
  }
}

function parseEnvContent(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

function validateExistingEnv(content) {
  const env = parseEnvContent(content);

  for (const key of REQUIRED_VARIABLES) {
    const value = env[key];

    if (typeof value !== 'string' || value.trim() === '') {
      error(
        `backend/.env is missing or contains an empty required variable: ${key}. Delete the file and run setup again.`,
      );
    }
  }

  const jwtSecret = env.JWT_SECRET;
  if (
    typeof jwtSecret !== 'string' ||
    jwtSecret.length < JWT_SECRET_MIN_LENGTH
  ) {
    error(
      `backend/.env contains a JWT_SECRET shorter than ${JWT_SECRET_MIN_LENGTH} characters. Delete the file and run setup again.`,
    );
  }
}

function bootstrap() {
  const backendDir = join(process.cwd(), 'backend');
  const examplePath = join(backendDir, '.env.example');
  const envPath = join(backendDir, '.env');
  const tempPath = join(backendDir, '.env.tmp');

  if (existsSync(tempPath)) {
    try {
      unlinkSync(tempPath);
    } catch {
      /* ignore */
    }
  }

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    validateExistingEnv(content);
    console.log(
      'backend/.env already exists and is valid, skipping bootstrap.',
    );
    process.exit(0);
  }

  if (!existsSync(examplePath)) {
    error('.env.example not found in backend/.');
  }

  const example = readFileSync(examplePath, 'utf8');
  validateExample(example);

  const secret = randomBytes(32).toString('hex');
  const content = example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);

  if (content.includes(JWT_SECRET_PLACEHOLDER)) {
    error('Failed to replace JWT_SECRET placeholder in .env.example.');
  }

  const parsed = parseEnvContent(content);
  if (!parsed.JWT_SECRET || parsed.JWT_SECRET.length < JWT_SECRET_MIN_LENGTH) {
    error('Generated .env contains a JWT_SECRET shorter than 32 characters.');
  }

  try {
    writeFileSync(tempPath, content, 'utf8');
    renameSync(tempPath, envPath);
  } catch (err) {
    if (existsSync(tempPath)) {
      try {
        unlinkSync(tempPath);
      } catch {
        /* ignore cleanup failure */
      }
    }
    error(`Failed to write backend/.env: ${err.message}`);
  }

  console.log('Created backend/.env with generated JWT_SECRET.');
}

bootstrap();
