const DEFAULT_API_PORT = 3000;
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';
const DEFAULT_JWT_EXPIRY = '1h';

interface ApplicationConfig {
  port: number;
  frontendOrigin: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiry: string;
}

function parsePort(value: unknown) {
  if (!value) {
    return DEFAULT_API_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function parseFrontendOrigin(value: unknown) {
  const origin =
    typeof value === 'string' && value.trim()
      ? value.trim()
      : DEFAULT_FRONTEND_ORIGIN;
  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    throw new Error('FRONTEND_ORIGIN must be a valid URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('FRONTEND_ORIGIN must use the HTTP or HTTPS protocol.');
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('FRONTEND_ORIGIN must not include a path, query, or hash.');
  }

  return url.origin;
}

function parseDatabaseUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('DATABASE_URL is required.');
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('DATABASE_URL must be a valid URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use the PostgreSQL protocol.');
  }

  if (!url.hostname || url.pathname === '/') {
    throw new Error('DATABASE_URL must include a host and database name.');
  }

  return url.toString();
}

function parseJwtSecret(value: unknown) {
  const secret = typeof value === 'string' && value.trim() ? value.trim() : '';

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters.');
  }

  return secret;
}

function parseJwtExpiry(value: unknown) {
  const expiry =
    typeof value === 'string' && value.trim()
      ? value.trim()
      : DEFAULT_JWT_EXPIRY;

  if (!/^\d+[smhd]?$/.test(expiry)) {
    throw new Error('JWT_EXPIRY must be a valid duration (e.g. 1h, 30m).');
  }

  return expiry;
}

export function getApplicationConfig(
  environment: Record<string, unknown>,
): ApplicationConfig {
  return {
    port: parsePort(environment.PORT),
    frontendOrigin: parseFrontendOrigin(environment.FRONTEND_ORIGIN),
    databaseUrl: parseDatabaseUrl(environment.DATABASE_URL),
    jwtSecret: parseJwtSecret(environment.JWT_SECRET),
    jwtExpiry: parseJwtExpiry(environment.JWT_EXPIRY),
  };
}

export function validateApplicationEnvironment(
  environment: Record<string, unknown>,
) {
  const config = getApplicationConfig(environment);

  return {
    ...environment,
    PORT: config.port,
    FRONTEND_ORIGIN: config.frontendOrigin,
    DATABASE_URL: config.databaseUrl,
    JWT_SECRET: config.jwtSecret,
    JWT_EXPIRY: config.jwtExpiry,
  };
}
