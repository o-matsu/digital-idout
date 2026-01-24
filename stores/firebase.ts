import { defineStore } from 'pinia'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { useAuthStore } from './auth'

interface MetaFile {
  name: string
  type: string
  src: string
}

interface MetaData {
  regionId: string
  authorId: string
  title: string
  targetRole: string
  comment: string
  files: MetaFile[]
  createdAt: Timestamp
}

interface Meta {
  id: string
  data: MetaData
}

interface RegionData {
  hasRoles: { GENERAL: boolean; EXPERT: boolean; PROJECT: boolean }
  points: Array<{ x: number; y: number; z: number }>
}

interface Region {
  id: string
  data: RegionData
}

interface User {
  userId: string
  displayName: string
  email: string
  role: string
}

interface FirebaseState {
  metas: Meta[]
  regions: Region[]
  users: User[]
}

const roleLevel = ['GENERAL', 'EXPERT', 'PROJECT']

const initialState = (): FirebaseState => ({
  metas: [],
  regions: [],
  users: []
})

export const useFirebaseStore = defineStore('firebase', {
  state: (): FirebaseState => ({ ...initialState() }),

  getters: {
    getRegions: (state) => state.regions,
    getMetasByRegion: (state) => (regionId: string) =>
      state.metas.filter((meta) => meta.data.regionId === regionId),
    getMetaById: (state) => (id: string) =>
      state.metas.find((meta) => meta.id === id),
    getUserName: (state) => (id: string) => {
      const user = state.users.find((user) => user.userId === id)
      return user?.displayName || 'Unknown'
    }
  },

  actions: {
    resetStore() {
      Object.assign(this.$state, initialState())
    },

    setRegions(regions: Region[]) {
      this.regions = regions
    },

    setMetas(metas: Meta[]) {
      this.metas.push(...metas)
    },

    resetMetas(metas: Meta[]) {
      this.metas = metas
    },

    setUser(user: User) {
      this.users.push(user)
    },

    async getRoleRegions(
      regions: Region[],
      role: string
    ): Promise<Region[]> {
      const db = getFirestore()
      const regionsRef = collection(db, 'regions')
      const q = query(regionsRef, where(`hasRoles.${role}`, '==', true))
      const regionDocs = await getDocs(q)

      regionDocs.forEach((docSnapshot) => {
        if (!regions.map((r) => r.id).includes(docSnapshot.id)) {
          regions.push({
            id: docSnapshot.id,
            data: docSnapshot.data() as RegionData
          })
        }
      })
      return regions
    },

    async fetchRoleRegions(): Promise<Region[]> {
      const authStore = useAuthStore()
      const role = authStore.isAuth ? authStore.getUser.role : 'GENERAL'
      let regions: Region[] = []

      for (let i = 0; i < roleLevel.indexOf(role) + 1; i++) {
        regions = await this.getRoleRegions(regions, roleLevel[i])
      }
      return regions
    },

    async loadRoleRegions() {
      const regions = await this.fetchRoleRegions()
      this.setRegions(regions)
    },

    async fetchMetasByRegion(regionId: string): Promise<Meta[]> {
      const authStore = useAuthStore()
      const role = authStore.isAuth ? authStore.getUser.role : 'GENERAL'
      const target = roleLevel.slice(0, roleLevel.indexOf(role) + 1)

      const db = getFirestore()
      const metasRef = collection(db, 'metas')
      const q = query(
        metasRef,
        where('regionId', '==', regionId),
        where('targetRole', 'in', target)
      )

      const metaDocs = await getDocs(q)
      const metas: Meta[] = []
      metaDocs.forEach((docSnapshot) => {
        metas.push({
          id: docSnapshot.id,
          data: docSnapshot.data() as MetaData
        })
      })
      return metas
    },

    async loadMetasByRegion(regionId: string, force: boolean = false) {
      if (
        this.metas.some((meta) => meta.data.regionId === regionId) &&
        !force
      ) {
        return
      }
      const metas = await this.fetchMetasByRegion(regionId)
      await this.loadAuthors(metas)
      if (force) {
        this.resetMetas(metas)
      } else {
        this.setMetas(metas)
      }
    },

    async fetchAuthor(userId: string): Promise<User | null> {
      const db = getFirestore()
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      return userDoc.exists() ? (userDoc.data() as User) : null
    },

    async loadAuthors(metas: Meta[]) {
      const authorIds = [...new Set(metas.map((meta) => meta.data.authorId))]
      await Promise.all(
        authorIds.map(async (authorId) => {
          if (!this.users.map((user) => user.userId).includes(authorId)) {
            const user = await this.fetchAuthor(authorId)
            if (user) this.setUser(user)
          }
        })
      )
    },

    async register(
      points: Array<{ x: number; y: number; z: number }>,
      meta: { title: string; target: string; comment: string },
      files: File[]
    ) {
      const regionId = await this.insertRegion(points)
      if (!regionId) throw new Error('Failed to create region')
      const metaId = await this.insertMeta(regionId, meta, files)
      this.loadRoleRegions()
      return { regionId, metaId }
    },

    async insertRegion(
      points: Array<{ x: number; y: number; z: number }>
    ): Promise<string | undefined> {
      const normalizedPoints = points.map((p) => ({ x: p.x, y: p.y, z: p.z }))
      const data = {
        hasRoles: {
          GENERAL: false,
          EXPERT: false,
          PROJECT: false
        },
        points: normalizedPoints
      }

      try {
        const db = getFirestore()
        const regionRef = await addDoc(collection(db, 'regions'), data)
        return regionRef.id
      } catch (e) {
        console.error(e)
        return undefined
      }
    },

    async insertMeta(
      regionId: string,
      meta: { title: string; target: string; comment: string },
      files: File[]
    ): Promise<string | undefined> {
      const authStore = useAuthStore()
      const filePaths: string[] = []

      try {
        const storage = getStorage()

        // Upload files to storage
        await Promise.all(
          files.map(async (file) => {
            const storageRef = ref(storage, `data/${file.name}`)
            await uploadBytes(storageRef, file)
            const path = await getDownloadURL(storageRef)
            filePaths.push(path)
          })
        )

        const db = getFirestore()

        // Insert record to firestore/metas
        const metaDoc = await addDoc(collection(db, 'metas'), {
          authorId: authStore.getId,
          title: meta.title,
          targetRole: meta.target,
          comment: meta.comment,
          regionId,
          files: files.map((file, i) => ({
            name: file.name,
            type: file.type,
            src: filePaths[i]
          })),
          createdAt: Timestamp.now()
        })

        // Update record in firestore/regions
        const regionRef = doc(db, 'regions', regionId)
        const regionDoc = await getDoc(regionRef)
        const docData = regionDoc.data()?.hasRoles

        await updateDoc(regionRef, {
          hasRoles: {
            GENERAL: docData?.GENERAL || meta.target === 'GENERAL',
            EXPERT: docData?.EXPERT || meta.target === 'EXPERT',
            PROJECT: docData?.PROJECT || meta.target === 'PROJECT'
          }
        })

        await this.loadMetasByRegion(regionId, true)
        return metaDoc.id
      } catch (e) {
        console.error(e)
        return undefined
      }
    },

    async deleteMeta(meta: Meta) {
      try {
        const storage = getStorage()
        const db = getFirestore()

        // Delete files from storage
        await Promise.all(
          meta.data.files.map(async (file) => {
            const storageRef = ref(storage, `data/${file.name}`)
            await deleteObject(storageRef)
          })
        )

        // Delete record from firestore/metas
        await deleteDoc(doc(db, 'metas', meta.id))

        // Update region hasRoles
        const regionId = meta.data.regionId
        const deletedRole = meta.data.targetRole

        const metasRef = collection(db, 'metas')
        const q = query(
          metasRef,
          where('regionId', '==', regionId),
          where('targetRole', '==', deletedRole)
        )
        const hasRole = await getDocs(q)

        if (hasRole.empty) {
          const regionRef = doc(db, 'regions', regionId)
          const regionDoc = await getDoc(regionRef)
          const docData = regionDoc.data()?.hasRoles

          await updateDoc(regionRef, {
            hasRoles: {
              GENERAL: deletedRole === 'GENERAL' ? false : docData?.GENERAL,
              EXPERT: deletedRole === 'EXPERT' ? false : docData?.EXPERT,
              PROJECT: deletedRole === 'PROJECT' ? false : docData?.PROJECT
            }
          })
        }

        this.resetStore()
      } catch (e) {
        console.error(e)
      }
    }
  }
})
