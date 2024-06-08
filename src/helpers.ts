import { capitalCase } from 'change-case';
import { randomInt } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Permissions } from 'oceanic.js';

export const defaultPerms: bigint[] = [
    Permissions.EMBED_LINKS,
    Permissions.VIEW_CHANNEL,
    Permissions.USE_EXTERNAL_EMOJIS
];

export const sanitize = (string: string) => string.replaceAll('_', '\_');
export const getDir = (path: string): string => dirname(fileURLToPath(path));
export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
export const getPermNames = (perms: bigint[]) => perms.map((perm) => capitalCase(Object.entries(Permissions).filter((v) => v[1] === BigInt(perm))[0][0])).join(', ');

export const truncateString = (string?: string, length = 2000) => {
	if (!string) return '';
	if (string.length <= length) return string;
	else return `${string.substring(0, Math.min(length - 3, string.length))}...`;
};

// prettier-ignore
export const parseWebhookURL = (url: string, db: boolean = false) => { if (db) {
	const values = url.split(':', 2);
	if (values.length < 2) return null;
	return { id: values[0], token: values[1] };
} else {
	const matches = url.match(/https?:\/\/(?:ptb\.|canary\.)?discord\.com\/api(?:\/v\d{1,2})?\/webhooks\/(\d{17,19})\/([\w-]{68})/i,);
	if (!matches || matches.length <= 2) return null;
	return { id: matches[1], token: matches[2] };
}};

// prettier-ignore
export function genDbId(length: 4 | 6 | 8 | 10 | 12) { switch (length) {
    case 4: return randomInt(1111, 9999);
    case 6: return randomInt(111111, 999999);
    case 8: return randomInt(11111111, 99999999);
    case 10: return randomInt(1111111111, 9999999999);
    case 12: return randomInt(111111111111, 999999999999);
}};
