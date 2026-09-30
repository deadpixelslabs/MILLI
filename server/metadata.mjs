import {traits, labels, hairs, outfits, backgrounds, originalBackgrounds} from '../scripts/character-art.mjs';

export const SUPPLY = 5555;
export const ORIGIN = 'https://milliformillion.xyz';
export const DESCRIPTION = 'Hazels CTO Freemint is a collection of 5,555 illustrated portraits with individual hair, outfit and background palettes.';
export const EDITIONS = ['Signature', 'Rare', 'Legendary'];

export function tokenId(value, extension = 'json') {
  if (typeof value !== 'string') return null;
  const match = value.match(new RegExp(`^([1-9][0-9]{0,3})(?:\\.${extension})?$`));
  if (!match) return null;
  const id = Number(match[1]);
  return id <= SUPPLY ? id : null;
}

export function metadata(id) {
  const t = traits(id);
  return {
    name: `Hazels CTO Freemint #${id}`,
    description: DESCRIPTION,
    image: `${ORIGIN}/images/${id}.svg`,
    external_url: `${ORIGIN}/#collection`,
    attributes: [
      {trait_type: 'Look', value: labels.look[t.look]},
      {trait_type: 'Hair', value: labels.hair[t.look]},
      {trait_type: 'Hair Color', value: hairs[t.hairColor]},
      {trait_type: 'Outfit', value: labels.outfit[t.look]},
      {trait_type: 'Outfit Color', value: outfits[t.outfitColor]},
      {trait_type: 'Background', value: t.backdrop ? backgrounds[t.backdrop] : originalBackgrounds[t.look]},
      {trait_type: 'Accessory', value: labels.accessory[t.look]},
      {trait_type: 'Edition', value: EDITIONS[t.rarity]},
    ],
  };
}

export const CSV_HEADERS = ['tokenID', 'name', 'description', 'file_name', 'external_url',
  'attributes[Look]', 'attributes[Hair]', 'attributes[Hair Color]', 'attributes[Outfit]',
  'attributes[Outfit Color]', 'attributes[Background]', 'attributes[Accessory]', 'attributes[Edition]'];
export function csvRow(id) {
  const m = metadata(id);
  return [id, m.name, m.description, `${id}.svg`, m.external_url, ...m.attributes.map(a => a.value)];
}

export function csvText() {
  const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
  const rows = [CSV_HEADERS];
  for (let id = 1; id <= SUPPLY; id++) rows.push(csvRow(id));
  return rows.map(row => row.map(quote).join(',')).join('\r\n') + '\r\n';
}
