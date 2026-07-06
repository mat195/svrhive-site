import entityData from '../data/entity.json';

export interface EntityLink {
  platform: string;
  url: string;
  status?: string;
}

export interface Release {
  slug: string;
  title: string;
  type?: 'MusicAlbum' | 'MusicRecording';
  role?: 'primary' | 'featured';
  primaryArtist?: string | null;
  featured?: string[];
  releaseDate?: string | null;
  upc?: string;
  isrcs?: string[];
  coverArt?: string | null;
  description?: string;
}

export interface Entity {
  canonicalName: string;
  artistSlug: string;
  siteBaseUrl: string;
  label: { name: string; slug: string };
  disambiguation: string;
  location: string;
  foundingLocation: string;
  identityUmbrella: string;
  primaryDescriptor: string;
  genresCore: string[];
  genresSchema: string[];
  genresQuarantined: string[];
  referenceArtists?: string[];
  bio25: string | null;
  bio100: string | null;
  bio300: string | null;
  activeSince: string | null;
  contactEmail: string | null;
  links: EntityLink[];
  releases: Release[];
}

export const entity = entityData as Entity;

/** Rule 2: the canonical artist name renders from ONE constant everywhere. */
export const CANONICAL_NAME = entity.canonicalName;
export const LABEL_NAME = entity.label.name;

export const SITE = entity.siteBaseUrl;
export const ARTIST_PATH = `/${entity.artistSlug}/`;

/** Only live/verified links become public sameAs (provenance). */
export function sameAsUrls(): string[] {
  return entity.links
    .filter((l) => l.url && /^https?:\/\//.test(l.url))
    .map((l) => l.url);
}

export function absolute(path: string): string {
  return new URL(path, SITE.endsWith('/') ? SITE : SITE + '/').toString();
}
