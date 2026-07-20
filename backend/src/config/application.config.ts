const DEFAULT_API_PORT = 3000;
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';

interface ApplicationConfig {
  port: number;
  frontendOrigin: string;
  databaseUrl: string;
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

export function getApplicationConfig(
  environment: Record<string, unknown>,
): ApplicationConfig {
  return {
    port: parsePort(environment.PORT),
    frontendOrigin: parseFrontendOrigin(environment.FRONTEND_ORIGIN),
    databaseUrl: parseDatabaseUrl(environment.DATABASE_URL),
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
  };
}
