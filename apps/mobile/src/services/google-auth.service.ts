import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

// Ensure any existing redirect sessions are completed
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verifiedEmail?: boolean;
}

// Configurable client ID via environment variable or active GCP project
const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '1052691199246-tk8kt8hv4ib4snvc7d99e0pqkr0fn2ls.apps.googleusercontent.com';

export const googleAuthService = {
  /**
   * Returns true if a valid Google Cloud Client ID is configured in environment
   */
  hasConfiguredClientId(): boolean {
    return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com'));
  },

  /**
   * Launch official Google OAuth2 sign-in session
   */
  async signIn(): Promise<GoogleUserProfile | null> {
    if (!this.hasConfiguredClientId()) {
      // Do not launch broken OAuth URL if GCP Client ID is not configured
      return null;
    }

    try {
      const state = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(),
      );

      const redirectUri = 'https://auth.expo.io/@lifeos/mobile';
      const scope = encodeURIComponent('openid profile email');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=token&scope=${scope}&state=${state}&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const hash = url.split('#')[1] || url.split('?')[1] || '';
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (accessToken) {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (userinfoRes.ok) {
            const data = await userinfoRes.json();
            return {
              id: data.id,
              email: data.email,
              name: data.name,
              picture: data.picture,
              verifiedEmail: data.verified_email,
            };
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  },
};
