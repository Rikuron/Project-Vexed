import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

/**
 * Uploads an array of File objecs to Firebase Storage
 * and returns their public download URLs.
 */
export async function uploadSolutionImages(
  files: File[], 
  solutionId: string
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const storageRef = ref(storage, `solutions/${solutionId}/images/${uniqueFilename}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  })

  return Promise.all(uploadPromises)
}

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB
/**
 * Uploads an avatar image to Firebase Storage
 * and returns its public download URL.
 */
export async function uploadAvatar(
  file: File,
  uid: string
): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) throw new Error('Only JPEG, PNG, and WebP images are allowed.')
  if (file.size > MAX_AVATAR_SIZE) throw new Error('Max file size of 2MB exceeded.')

  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `avatars/${uid}.${ext}`)
  const snapshot = await uploadBytes(storageRef, file)

  return getDownloadURL(snapshot.ref)
}