import { Collection } from '@discordjs/collection';
import { capitalCase } from 'change-case';
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

export const replacer = (key: string, value: any) => {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Map) return { dataType: 'Map', value: [...value]};
    return value;
};

export const reviver = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') return new Collection(value.value);
    }
    return value;
}
