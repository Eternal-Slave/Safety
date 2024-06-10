import Redis from 'ioredis';
import { GuildI, SafetyProfileI } from './types';
import { Collection } from '@discordjs/collection';
import Guild from './models/Guild';
import dayjs from 'dayjs';
import SafetyProfile from './models/SafetyProfile';
import { UpdateQuery } from 'mongoose';

export const redis = new Redis(process.env.REDIS_URL!);

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

export const getGuild = async (guildId: string): Promise<GuildI | null> => {
    const cachedGuild = await redis.get(`es_guild:${guildId}`);
    if (cachedGuild) return JSON.parse(cachedGuild, reviver);
    if (await redis.exists(`es_cooldown:fetch-guild:${guildId}`)) return null;
    const dbGuild = await Guild.findOne({ guild: guildId });

    if (dbGuild) {
        await redis.set(`es_guild:${guildId}`, JSON.stringify(dbGuild.toObject(), replacer));
        return dbGuild.toObject();
    } else await redis.set(`es_cooldown:fetch-guild:${guildId}`, dayjs.utc().toISOString());

    return null;
};

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
    if (profile.flags.size < 1 && profile.restrictions.size < 1) await redis.del(`es_safety:${userId}`);
    else await redis.set(`es_safety:${userId}`, JSON.stringify(profile.toObject(), replacer));
    return profile.toObject();
};

export const updateGuild = async (guildId: string, query: UpdateQuery<GuildI>) => {
    const guild = await Guild.findOneAndUpdate({ guild: guildId }, query, { new: true });
    if (!guild) throw new Error('The specified guild does not exist.');
    await redis.set(`es_guild:${guildId}`, JSON.stringify(guild.toObject(), replacer));
    return guild.toObject();
};
