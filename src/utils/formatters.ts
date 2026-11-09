export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins}:${paddedSecs}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function cleanSongTitle(rawTitle?: string, fallbackFilename?: string): string {
  if (rawTitle && rawTitle.trim().length > 0) {
    return rawTitle.trim();
  }
  if (!fallbackFilename) return 'Unknown Title';
  
  // Remove file extension
  let clean = fallbackFilename.replace(/\.[^/.]+$/, '');
  // Remove leading track numbers like "01 - ", "01. "
  clean = clean.replace(/^\d+[\s.-]+/, '');
  // Replace underscores with spaces
  clean = clean.replace(/_/g, ' ');
  return clean.trim() || 'Unknown Title';
}

export function cleanArtistName(artist?: string): string {
  if (!artist || artist.trim().length === 0 || artist.toLowerCase() === '<unknown>') {
    return 'Unknown Artist';
  }
  return artist.trim();
}

export function cleanAlbumName(album?: string): string {
  if (!album || album.trim().length === 0 || album.toLowerCase() === '<unknown>') {
    return 'Unknown Album';
  }
  return album.trim();
}
