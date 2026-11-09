const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brl0 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** 12.9 → "R$ 12,90" */
export const formatBRL = (value: number, decimals: 0 | 2 = 2) =>
  (decimals === 0 ? brl0 : brl).format(Number.isFinite(value) ? value : 0);

/** "2027-03-25" → "25/03/2027" */
export function isoToBR(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** "25/03/2027" → Date local, ou null se a data não existir */
export function parseBR(br: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br.trim());
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

/** "25/03/2027" → "2027-03-25" */
export function brToISO(br: string): string {
  const [d, m, y] = br.trim().split('/');
  return `${y}-${m}-${d}`;
}

/** Valida a data de validade digitada no formulário. Retorna a mensagem de erro ou null. */
export function validateExpiry(br: string): string | null {
  const date = parseBR(br);
  if (!date) return 'Validade inválida. Use o formato DD/MM/AAAA.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return 'A validade não pode ser uma data passada.';
  return null;
}

// ---------- Validade ----------

/** Prazo (em dias) a partir do qual um produto é considerado "vencendo". */
export const EXPIRY_WARNING_DAYS = 30;

export type ExpiryStatus = 'expired' | 'soon' | 'ok';

/** Dias até a validade ("25/03/2027"). Negativo = vencido; 0 = vence hoje. */
export function daysUntilExpiry(br: string): number {
  const date = parseBR(br);
  if (!date) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

export function expiryStatus(br: string): { status: ExpiryStatus; days: number } {
  const days = daysUntilExpiry(br);
  if (days < 0) return { status: 'expired', days };
  if (days <= EXPIRY_WARNING_DAYS) return { status: 'soon', days };
  return { status: 'ok', days };
}

/** Texto curto do selo: "Vencido há 3 dias", "Vence hoje", "Vence em 12 dias". */
export function expiryLabel(br: string): string {
  const { status, days } = expiryStatus(br);
  if (status === 'expired') return days === -1 ? 'Vencido há 1 dia' : `Vencido há ${-days} dias`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence amanhã';
  return `Vence em ${days} dias`;
}

// ---------- Segurança ----------

/**
 * Escapa caracteres especiais de HTML. Use sempre que um dado digitado por usuário
 * (nome de produto, emoji, datas de filtro) for inserido em HTML montado como texto,
 * para evitar XSS (OWASP A03 – Injection).
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
