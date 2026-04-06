import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

/**
 * Uploads an array of File objecs to Firebase Storage
 * and returns their public download URLs.
 */
export async function uploadImages(
  files: File[], 
  basePath: string = 'solutions'
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const storageRef = ref(storage, `${basePath}/${uniqueFilename}`)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  })

  return Promise.all(uploadPromises)
}