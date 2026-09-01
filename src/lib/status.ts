export type StatusTone = "default" | "pending" | "warning" | "danger" | "success";

export function normalizeOrderBackendStatus(status?: number | string | null) {
  if (typeof status === "number") {
    return status;
  }

  switch (status) {
    case "pedido_recebido":
      return 1;
    case "aguardando_pagamento":
      return 2;
    case "pagamento_recebido":
      return 3;
    case "pagamento_cancelado":
      return 4;
    case "pedido_analise":
      return 5;
    case "pedido_separacao":
      return 6;
    case "pedido_faturado":
      return 7;
    case "pedido_enviado":
      return 8;
    case "pedido_entregue":
      return 9;
    case "pedido_cancelado":
      return 10;
    case "pedido_devolvido":
      return 11;
    case "excecao_transporte":
      return 12;
    case "boleto_vencido":
      return 13;
    case "cancelamento_solicitado":
      return 14;
    default:
      return null;
  }
}

export function getOrderBackendStatusLabel(status?: number | string | null) {
  switch (normalizeOrderBackendStatus(status)) {
    case 1:
      return "Pedido recebido";
    case 2:
      return "Aguardando pagamento";
    case 3:
      return "Pagamento recebido";
    case 4:
      return "Pagamento cancelado";
    case 5:
      return "Pedido em análise";
    case 6:
      return "Pedido em separação";
    case 7:
      return "Pedido faturado";
    case 8:
      return "Pedido enviado";
    case 9:
      return "Pedido entregue";
    case 10:
      return "Pedido cancelado";
    case 11:
      return "Pedido devolvido";
    case 12:
      return "Exceção no transporte";
    case 13:
      return "Boleto vencido";
    case 14:
      return "Cancelamento solicitado";
    default:
      return status === undefined || status === null || status === "" ? "-" : String(status);
  }
}

export function getOrderBackendStatusTone(status?: number | string | null): StatusTone {
  switch (normalizeOrderBackendStatus(status)) {
    case 1:
    case 3:
    case 7:
    case 8:
    case 9:
      return "success";
    case 2:
    case 5:
    case 6:
    case 14:
      return "warning";
    case 4:
    case 10:
    case 11:
    case 12:
    case 13:
      return "danger";
    default:
      return "default";
  }
}

export function normalizeOrderDownloadStatus(status?: string | null) {
  switch (status) {
    case "downloaded":
      return "downloaded";
    case "processing":
      return "downloaded";
    case "imported":
    case "processed":
    case "BAIXADO":
      return "imported";
    case "import_failed":
    case "error":
    case "ERRO":
      return "import_failed";
    case "corrected":
      return "corrected";
    default:
      return "not_downloaded";
  }
}

export function getOrderDownloadStatusLabel(status?: string | null) {
  switch (normalizeOrderDownloadStatus(status)) {
    case "downloaded":
      return "Baixado";
    case "imported":
      return "Importado";
    case "import_failed":
      return "Falha na importação";
    case "corrected":
      return "Corrigido";
    default:
      return "Não baixado";
  }
}

export function getOrderDownloadStatusTone(status?: string | null): StatusTone {
  switch (normalizeOrderDownloadStatus(status)) {
    case "imported":
      return "success";
    case "import_failed":
      return "danger";
    case "corrected":
      return "pending";
    case "downloaded":
      return "default";
    case "not_downloaded":
    default:
      return "warning";
  }
}

export const normalizeOrderImportStatus = normalizeOrderDownloadStatus;
export const getOrderImportStatusLabel = getOrderDownloadStatusLabel;
export const getOrderImportStatusTone = getOrderDownloadStatusTone;
