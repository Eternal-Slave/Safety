import { Collection } from '@discordjs/collection';
import { capitalCase } from 'change-case';
import { randomInt } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Permissions } from 'oceanic.js';
import { GuildI, SafetyProfileI } from './types';
import SafetyProfile from './models/SafetyProfile';
import dayjs from 'dayjs';
import { UpdateQuery } from 'mongoose';
import Redis from 'ioredis';
import Guild from './models/Guild';

export const defaultPerms: bigint[] = [
    Permissions.EMBED_LINKS,
    Permissions.VIEW_CHANNEL,
    Permissions.USE_EXTERNAL_EMOJIS
];

export const redis = new Redis(process.env.REDIS_URL!);
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
};

// prettier-ignore
export function genDbId(length: 4 | 6 | 8 | 10 | 12) { switch (length) {
    case 4: return randomInt(1111, 9999);
    case 6: return randomInt(111111, 999999);
    case 8: return randomInt(11111111, 99999999);
    case 10: return randomInt(1111111111, 9999999999);
    case 12: return randomInt(111111111111, 999999999999);
}};

export const getProfile = async <T extends boolean = false>(userId: string, fetch?: T): Promise<SafetyProfileI | null> => {
    const redisProfile = await redis.get(`es_safety:${userId}`);
    const cachedProfile: SafetyProfileI | null = redisProfile ? JSON.parse(redisProfile, reviver) : null;
    if (cachedProfile) return cachedProfile;
    if (!fetch || await redis.exists(`es_cooldown_hold:fetch-safety:${userId}`)) return null;
    const dbProfile = await SafetyProfile.findById(userId);

    if (dbProfile) {
        await redis.set(`es_safety:${userId}`, JSON.stringify(dbProfile.toObject(), replacer));
        return dbProfile.toObject();
    } else await redis.set(`es_cooldown_hold:fetch-safety:${userId}`, dayjs.utc().toISOString());

    return null;
};

export const updateProfile = async (userId: string, query: UpdateQuery<SafetyProfileI>) => {
    let profile = await SafetyProfile.findByIdAndUpdate(userId, query, { new: true });
    if (!profile) profile = await SafetyProfile.create({ _id: userId })
        .then(async () => await SafetyProfile.findByIdAndUpdate(userId, query, { new: true }));
    
    if (!profile) throw new Error('The specified safety profile does not exist.');
    if (profile.flags.size < 1 && profile.restrictions.size < 1) return profile.toObject();
    await redis.set(`es_safety:${userId}`, JSON.stringify(profile.toObject(), replacer));
    return profile.toObject();
};

export const updateGuild = async (guildId: string, query: UpdateQuery<GuildI>) => {
    const guild = await Guild.findOneAndUpdate({ guild: guildId }, query, { new: true });
    if (!guild) throw new Error('The specified guild does not exist.');
    await redis.set(`es_guild:${guildId}`, JSON.stringify(guild.toObject(), replacer));
    return guild.toObject();
};

export const getGuild = async <X extends boolean = false>(guildId: string, fetch?: X): Promise<GuildI | null> => {
    const cachedGuild = await redis.get(`es_guild:${guildId}`);
    if (cachedGuild) return JSON.parse(cachedGuild, reviver);
    if (!fetch || await redis.exists(`es_cooldown:fetch-guild:${guildId}`)) return null;
    const dbGuild = await Guild.findOne({ guild: guildId });

    if (dbGuild) {
        await redis.set(`es_guild:${guildId}`, JSON.stringify(dbGuild.toObject(), replacer));
        return dbGuild.toObject();
    } else await redis.set(`es_cooldown:fetch-guild:${guildId}`, dayjs.utc().toISOString());

    return null;
};
