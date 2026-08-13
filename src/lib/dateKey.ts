/**
 * Datas de evento são sempre guardadas como meia-noite UTC (sem
 * componente de hora/fuso). Extrair "yyyy-MM-dd" direto da string ISO
 * evita que a conversão pro fuso local do navegador "empurre" a data
 * um dia pra trás (ex: fusos negativos como o do Brasil).
 */
export function dateKeyFromISO(iso: string): string {
  return iso.slice(0, 10);
}
