import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { getCurrentUser, useFirebaseApp } from 'vuefire'

export default defineNuxtPlugin((nuxtApp) => {
  const firebaseApp = useFirebaseApp()
  const auth = getAuth(firebaseApp)
  const firestore = getFirestore(firebaseApp)
  const storage = getStorage(firebaseApp)

  // Provide Firebase instances with compatibility layer for Nuxt 2 code
  const $fire = {
    auth,
    firestore: {
      collection: (path: string) => ({
        doc: (id: string) => ({
          get: async () => {
            const docRef = doc(firestore, path, id)
            const snapshot = await getDoc(docRef)
            return {
              exists: snapshot.exists(),
              data: () => snapshot.data(),
              ref: docRef,
            }
          },
          set: async (data: any) => {
            const docRef = doc(firestore, path, id)
            await updateDoc(docRef, data)
          },
        }),
        add: async (data: any) => {
          const collectionRef = collection(firestore, path)
          return await addDoc(collectionRef, data)
        },
        where: (field: string, operator: any, value: any) => ({
          get: async () => {
            const collectionRef = collection(firestore, path)
            const q = query(collectionRef, where(field, operator, value))
            const snapshot = await getDocs(q)
            return {
              forEach: (callback: (doc: any) => void) => {
                snapshot.forEach((docSnap) => {
                  callback({
                    id: docSnap.id,
                    data: () => docSnap.data(),
                  })
                })
              },
              empty: snapshot.empty,
            }
          },
          where: (field2: string, operator2: any, value2: any) => ({
            get: async () => {
              const collectionRef = collection(firestore, path)
              const q = query(
                collectionRef,
                where(field, operator, value),
                where(field2, operator2, value2),
              )
              const snapshot = await getDocs(q)
              return {
                forEach: (callback: (doc: any) => void) => {
                  snapshot.forEach((docSnap) => {
                    callback({
                      id: docSnap.id,
                      data: () => docSnap.data(),
                    })
                  })
                },
                empty: snapshot.empty,
              }
            },
          }),
        }),
      }),
    },
    storage: {
      ref: (path: string) => {
        const ref = storageRef(storage, path)
        return {
          put: async (file: File) => {
            return await uploadBytes(ref, file)
          },
          getDownloadURL: async () => {
            return await getDownloadURL(ref)
          },
          delete: async () => {
            return await deleteObject(ref)
          },
        }
      },
    },
  }

  const $fireModule = {
    auth: {
      GoogleAuthProvider,
    },
    firestore: {
      FieldValue: {
        serverTimestamp,
      },
      Timestamp,
    },
  }

  return {
    provide: {
      fire: $fire,
      fireModule: $fireModule,
      getCurrentUser,
    },
  }
})
