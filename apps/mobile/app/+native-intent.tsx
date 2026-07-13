// Incoming OAuth deep links (shoppingchecklist://oauthredirect?...) are
// consumed by expo-auth-session's pending browser session; they must not be
// treated as navigation, otherwise expo-router shows "Unmatched Route".
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  if (path.includes('oauthredirect')) {
    return '/';
  }

  return path;
}
