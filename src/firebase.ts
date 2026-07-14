import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Connection test
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc from server to test connection
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection successful.");
  } catch (error: any) {
    // If we get a permission-denied error, it means we successfully reached the Firestore backend
    if (error.code === 'permission-denied') {
      console.log("Firestore connection successful (reached server).");
      return;
    }
    
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. Please check your Firebase configuration and network.");
    } else {
      console.error("Firestore connection test error:", error);
    }
  }
}

testConnection();

export default app;
