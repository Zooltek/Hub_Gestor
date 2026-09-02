/**
 * Hub Client — Ponto de entrada consolidado da API do Hub Gestor.
 * 
 * Re-exporta todos os submódulos especializados da camada de API, garantindo
 * alta coesão, facilidade de manutenção e 100% de compatibilidade retroativa
 * com todas as páginas e componentes do sistema.
 */

export * from "./modules/auth";
export * from "./modules/orders";
export * from "./modules/pipeline";
export * from "./modules/catalog";
export * from "./modules/marketplace";
export * from "./modules/plugins";
export * from "./modules/metrics";
export * from "./modules/health";
export * from "./types";
export * from "./http";
