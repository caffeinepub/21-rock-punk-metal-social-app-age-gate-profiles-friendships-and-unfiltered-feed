import type { Genre } from '../backend';

export function getGenreLabel(genre: Genre): string {
  if ('rock' in genre) return 'Rock';
  if ('punk' in genre) return 'Punk';
  if ('metal' in genre) return 'Metal';
  if ('hardcore' in genre) return 'Hardcore';
  if ('alternative' in genre) return 'Alternative';
  if ('grunge' in genre) return 'Grunge';
  if ('indie' in genre) return 'Indie';
  if ('other' in genre) return genre.other;
  return 'Unknown';
}

export const GENRE_OPTIONS: { label: string; value: Genre }[] = [
  { label: 'Rock', value: { __kind__: 'rock', rock: null } },
  { label: 'Punk', value: { __kind__: 'punk', punk: null } },
  { label: 'Metal', value: { __kind__: 'metal', metal: null } },
  { label: 'Hardcore', value: { __kind__: 'hardcore', hardcore: null } },
  { label: 'Alternative', value: { __kind__: 'alternative', alternative: null } },
  { label: 'Grunge', value: { __kind__: 'grunge', grunge: null } },
  { label: 'Indie', value: { __kind__: 'indie', indie: null } },
];
