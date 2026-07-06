import type { APIRoute } from 'astro';
import { entity, CANONICAL_NAME, LABEL_NAME } from '../lib/entity';

// llms.txt — a plain-text map for LLM crawlers (llmstxt.org). Low expected value;
// shipped anyway per brief. Generated from the entity master.
export const GET: APIRoute = () => {
  const base = entity.siteBaseUrl;
  const lines: string[] = [];
  lines.push(`# ${LABEL_NAME}`);
  lines.push('');
  lines.push(`> ${LABEL_NAME} is an independent Canadian record label, home of ${CANONICAL_NAME}, a ${entity.identityUmbrella}. ${entity.disambiguation}`);
  lines.push('');
  lines.push('## Artist');
  lines.push(`- [${CANONICAL_NAME}](${base}/lucius-p-thundercat/): ${entity.primaryDescriptor}.`);
  lines.push('');
  if (entity.releases.length) {
    lines.push('## Releases');
    for (const r of entity.releases) {
      lines.push(`- [${r.title}](${base}/lucius-p-thundercat/releases/${r.slug}/)`);
    }
    lines.push('');
  }
  if (entity.links.length) {
    lines.push('## Profiles');
    for (const l of entity.links) lines.push(`- ${l.platform}: ${l.url}`);
    lines.push('');
  }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
