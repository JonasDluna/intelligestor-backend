/**
 * Utilitários para manipulação de imagens
 */

/**
 * Converte URLs de imagem HTTP para HTTPS
 * Resolve problemas de Mixed Content em produção
 */
export function secureImageUrl(url: string): string {
  if (!url) return '';
  
  // Se já é HTTPS, retorna como está
  if (url.startsWith('https://')) {
    return url;
  }
  
  // Se é HTTP, converte para HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // Se é URL relativa, assume HTTPS
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  return url;
}

/**
 * Obtém a primeira imagem de um array de URLs de forma segura
 */
export function getFirstSecureImage(pictures: string[] | undefined): string | null {
  if (!pictures || pictures.length === 0) {
    return null;
  }
  
  return secureImageUrl(pictures[0]);
}