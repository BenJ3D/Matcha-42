declare const window: any;

export const environment = {
  production: typeof window !== 'undefined' && window.__env ? window.__env.production : false,
  apiURL: typeof window !== 'undefined' && window.__env ? window.__env.apiUrl + 'api' : 'http://localhost:8000/api',
  frontURL: typeof window !== 'undefined' && window.__env ? window.__env.frontUrl : 'http://localhost:4200/'
};
