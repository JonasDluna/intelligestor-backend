/**
 * Utilitários para formatação de valores monetários
 */

/**
 * Formata um valor como moeda brasileira (R$)
 * @param value - Valor a ser formatado
 * @returns String formatada como R$ X,XX ou R$ 0,00 se inválido
 */
export function formatPrice(value: any): string {
  // Se é null, undefined ou string vazia
  if (value == null || value === '' || value === 'null') {
    return '0,00';
  }

  // Tenta converter para número
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  // Se não é um número válido
  if (isNaN(numValue) || numValue < 0) {
    return '0,00';
  }

  // Formata com 2 casas decimais e troca ponto por vírgula
  return numValue.toFixed(2).replace('.', ',');
}

/**
 * Formata um valor como moeda completa (R$ X,XX)
 */
export function formatCurrency(value: any): string {
  return `R$ ${formatPrice(value)}`;
}