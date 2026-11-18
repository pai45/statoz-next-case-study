declare const __STATOZ_BASE_PATH__: string;

export const BASE_PATH = typeof __STATOZ_BASE_PATH__ === 'undefined' ? '' : __STATOZ_BASE_PATH__;
export function sitePath(value: string) {
  if (!BASE_PATH || !value.startsWith('/') || value.startsWith('//') || value === BASE_PATH || value.startsWith(BASE_PATH + '/')) return value;
  return BASE_PATH + value;
}
export const routePath = () => (location.pathname.startsWith(BASE_PATH + '/') ? location.pathname.slice(BASE_PATH.length) : location.pathname).replace(/\/$/, '') || '/';
export const productBase = (product: 'sports' | 'games') => BASE_PATH
  ? location.origin + BASE_PATH + '/demos/' + product
  : `http://127.0.0.1:${product === 'sports' ? 4412 : 4413}/statoz-next-${product}-web`;
