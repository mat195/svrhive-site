import { entity, CANONICAL_NAME, LABEL_NAME, sameAsUrls, absolute } from './entity';
import type { Release } from './entity';

type Json = Record<string, unknown>;

/** Strip null/undefined/empty-array fields so TODO facts are omitted, not placeheld. */
export function clean<T extends Json>(obj: T): T {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

const ORG_ID = absolute('/#organization');
const ARTIST_ID = absolute(`/${entity.artistSlug}/#musicgroup`);
const WEBSITE_ID = absolute('/#website');

export function organizationLd(): Json {
  return clean({
    '@type': 'MusicGroup',
    '@id': ORG_ID,
    name: LABEL_NAME,
    url: absolute('/'),
    foundingLocation: entity.foundingLocation,
    description: `${LABEL_NAME} is an independent Canadian record label. Home of ${CANONICAL_NAME}.`,
  });
}

export function websiteLd(): Json {
  return clean({
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absolute('/'),
    name: LABEL_NAME,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  });
}

export function musicGroupLd(): Json {
  return clean({
    '@type': 'MusicGroup',
    '@id': ARTIST_ID,
    name: CANONICAL_NAME,
    url: absolute(`/${entity.artistSlug}/`),
    description: entity.bio100 ?? entity.primaryDescriptor,
    disambiguatingDescription: entity.disambiguation,
    genre: entity.genresSchema,
    foundingLocation: entity.foundingLocation,
    recordLabel: { '@id': ORG_ID },
    sameAs: sameAsUrls(),
  });
}

export function breadcrumbLd(crumbs: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absolute(c.path),
    })),
  };
}

export function releaseLd(r: Release): Json {
  // Attribution: primary-role releases are byArtist our artist; featured-role
  // releases are byArtist the primary artist (if known) with our artist as a
  // contributor. Never misattribute a guest feature as a primary credit.
  const isPrimary = (r.role ?? 'primary') === 'primary';
  const byArtist = isPrimary
    ? { '@id': ARTIST_ID }
    : r.primaryArtist
      ? { '@type': 'MusicGroup', name: r.primaryArtist }
      : undefined;
  const contributor = !isPrimary ? { '@id': ARTIST_ID } : undefined;

  const guestNames = [
    ...(r.featured ?? []),
    ...(!isPrimary ? [CANONICAL_NAME] : []),
  ];

  return clean({
    '@type': r.type ?? 'MusicRecording',
    '@id': absolute(`/${entity.artistSlug}/releases/${r.slug}/#release`),
    name: r.title,
    url: absolute(`/${entity.artistSlug}/releases/${r.slug}/`),
    byArtist,
    contributor,
    datePublished: r.releaseDate ?? undefined,
    ...(r.upc ? { gtin: r.upc } : {}),
    ...(r.isrcs && r.isrcs.length ? { isrcCode: r.isrcs } : {}),
    recordLabel: { '@id': ORG_ID },
    description: r.description,
    ...(guestNames.length ? { musicBy: guestNames.map((n) => ({ '@type': 'MusicGroup', name: n })) } : {}),
    ...(r.coverArt ? { image: absolute(r.coverArt) } : {}),
  });
}

/** Wrap nodes in a single @graph document. */
export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
