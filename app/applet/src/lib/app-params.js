const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get('clear_access_token') === 'true';

const clearStoredAccessToken = () => {
  if (isNode) return;
  window.localStorage.removeItem('base44_access_token');
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('sb-token');
};

const getAccessToken = () => {
  if (isNode) return null;
  return (
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('base44_access_token') ||
    window.localStorage.getItem('sb-token') ||
    null
  );
};

const getAppParams = () => {
  if (isClearAccessTokenRequested()) {
    clearStoredAccessToken();
  }
  return {
    appId: import.meta.env.VITE_BASE44_APP_ID || 'afiya-sauti',
    token: getAccessToken(),
    functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1',
    appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL || '',
  };
};

export const appParams = {
  ...getAppParams(),
};
