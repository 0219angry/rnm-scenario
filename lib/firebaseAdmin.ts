import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Vercelの環境変数にサービスアカウントJSONをそのまま入れにくい場合、base64で渡してdecode
const sa = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf8')
);

const adminApp: App =
  getApps().length ? getApps()[0] :
  initializeApp({ credential: cert(sa) });

export const adminDb = getFirestore(adminApp);