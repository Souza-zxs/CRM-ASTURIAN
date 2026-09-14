// Meta rolls this forward roughly once a year; bump when Meta deprecates it.
export const INSTAGRAM_GRAPH_API_VERSION = 'v21.0';
export const INSTAGRAM_GRAPH_API_BASE_URL = `https://graph.instagram.com/${INSTAGRAM_GRAPH_API_VERSION}`;
// Short-lived-code exchange uses Instagram's own OAuth host, not
// graph.instagram.com — this is "Instagram API with Instagram Login", not
// the Facebook-Page-mediated Instagram Graph API.
export const INSTAGRAM_OAUTH_TOKEN_URL =
  'https://api.instagram.com/oauth/access_token';
