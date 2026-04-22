import { openDB } from 'idb';
import { db as firestoreDB } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const DB_NAME = 'AcademicProjectBuilderDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const store = db.createObjectStore('projects', { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveProjectLocal = async (project) => {
  const db = await initDB();
  const tx = db.transaction('projects', 'readwrite');
  project.updatedAt = Date.now();
  await tx.store.put(project);
  await tx.done;
  return project;
};

export const getProjectsLocal = async () => {
  const db = await initDB();
  return db.getAllFromIndex('projects', 'updatedAt');
};

export const getProjectById = async (id) => {
  const db = await initDB();
  return db.get('projects', id);
};

export const queueSyncAction = async (action) => {
  const db = await initDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  await tx.store.add({ ...action, timestamp: Date.now() });
  await tx.done;
};

// Serverless Cloud Sync
export const processSyncQueue = async () => {
  const db = await initDB();
  const allActions = await db.getAll('syncQueue');
  if (allActions.length === 0) return;
  
  console.log(`[Firebase Sync Engine] Pushing ${allActions.length} local actions to Cloud...`);
  
  try {
    for (const action of allActions) {
       if (action.projectId) {
         const proj = await db.get('projects', action.projectId);
         if (proj) {
            // Push to Google Firebase document: /projects/{id}
            await setDoc(doc(firestoreDB, "projects", proj.id), proj);
         }
       }
    }
  } catch (e) {
    console.error("Firebase Cloud Sync Failed - Are your credentials configured in firebaseConfig.js?", e);
    return; // Retain queue so it tries again when online or configured
  }

  const tx = db.transaction('syncQueue', 'readwrite');
  await tx.store.clear();
  await tx.done;
  console.log('[Firebase Sync Engine] Cloud Sync Complete!');
};
