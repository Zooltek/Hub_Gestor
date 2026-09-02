/**
 * Logger centralizado para o Hub Gestor.
 *
 * Em PRODUÇÃO (import.meta.env.PROD), todos os logs são silenciados para
 * evitar exposição de stack traces, URLs internas e mensagens do servidor
 * no console do browser do usuário final.
 *
 * Em DESENVOLVIMENTO (import.meta.env.DEV), os logs são exibidos normalmente.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
    // TODO: Integrar com serviço de monitoramento (ex: Sentry, Datadog) em produção
    // if (import.meta.env.PROD) Sentry.captureException(args[0]);
  },
};
