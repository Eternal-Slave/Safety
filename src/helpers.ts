import { capitalCase } from 'change-case';
import dayjs from 'dayjs';
import { randomInt } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSONUser, Permissions, User } from 'oceanic.js';

export const defaultPerms: bigint[] = [
    Permissions.EMBED_LINKS,
    Permissions.VIEW_CHANNEL,
    Permissions.USE_EXTERNAL_EMOJIS
];

export const getDir = (path: string) => dirname(fileURLToPath(path));
export const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);
export const formatDate = (date: Date|null) => dayjs.utc(date).tz('Etc/UTC').format('MMMM Do, YYYY @ HH:mm');
export const getAuthority = (level?: number) => level === 5 ? 'ES Safety' : level && level > 5 ? 'ES Team' : null;
export const getPermNames = (perms: bigint[]) => perms.map((perm) => capitalCase(Object.entries(Permissions).filter((v) => v[1] === BigInt(perm))[0][0])).join(', ');

export const sanitize = (string: string) => {
	return string.replace(/(?<!`)`(?!`)/g, "\\`")
	.replace(/(<a?:[^\s:]+:\d+>|```[\s\S]*?```|_)/g, (str) => (str.match(/<a?:[^\s:]+:\d+>/g) || str.match(/```[\s\S]*?```/g)) ? str : str.replace(/_/g, '\\_'));
};

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

// prettier-ignore
export const name = (user: User|JSONUser, type: 1|2 = 1) => { switch (type) {
	case 1: return user.globalName ? `${user.globalName} (${user.username})` : user.username;
	case 2: return `${user.username} (${user.id})`;
}};
