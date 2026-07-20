const DEFAULT_API_PORT = 3000;
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';

interface ApplicationConfig {
  port: number;
  frontendOrigin: string;
}

function parsePort(value: string | undefined) {
  if (!value) {
    return DEFAULT_API_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function parseFrontendOrigin(value: string | undefined) {
  const origin = value?.trim() || DEFAULT_FRONTEND_ORIGIN;
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

export function getApplicationConfig(
  environment: NodeJS.ProcessEnv,
): ApplicationConfig {
  return {
    port: parsePort(environment.PORT),
    frontendOrigin: parseFrontendOrigin(environment.FRONTEND_ORIGIN),
  };
}
