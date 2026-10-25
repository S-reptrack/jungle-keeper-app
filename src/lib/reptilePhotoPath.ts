/** Storage policies require the owner's ID as the first folder. */
export function reptilePhotoPath(userId: string, reptileId: string, fileName: string, timestamp = Date.now()) {
  const extension = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${userId}/${reptileId}/${timestamp}.${extension}`;
}