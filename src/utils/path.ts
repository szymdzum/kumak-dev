/**
 * Checks if a given path should be considered "active" based on the current URL
 * Handles nested routes and normalizes trailing slashes
 */
export function isPathActive(currentPath: string, targetPath: string): boolean {
  // Handle root path as a special case
  if (targetPath === '/' && currentPath !== '/') {
    return false
  }

  // Normalize paths to remove trailing slashes
  const normalizedCurrent = currentPath.endsWith('/') && currentPath !== '/' ? currentPath.slice(0, -1) : currentPath

  const normalizedTarget = targetPath.endsWith('/') && targetPath !== '/' ? targetPath.slice(0, -1) : targetPath

  // Check if current path is the target or a subpath of target
  return normalizedCurrent === normalizedTarget ||
    (normalizedTarget !== '/' && normalizedCurrent.startsWith(normalizedTarget))
}
