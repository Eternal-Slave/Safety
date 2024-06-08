import Client from '@/Client';
import { redis, replacer } from '@/store';
import { ActivityTypes, SendStatuses } from 'oceanic.js';

interface Presence {
    message: string;
    status: SendStatuses;
}

const presences: Presence[] = [
    { status: 'online', message: 'Watching over the BDSM community...' }
];

interface StaffCache {
    id: string;
    level: number;
    username: string;
    displayName: string;
}

export default async (client: Client) => {
    client.ready = true;
    console.log(`[MANAGER] ${client.user.tag} has successfully started.`);

    const formatter = new Intl.NumberFormat('en', { notation: 'compact' });
    const guildCount = () => client.guilds.size.toString();
    const userCount = () => formatter.format(+client.guilds.reduce((g, { memberCount }) => g + memberCount, 0));

    let index = 0;
    setInterval(async () => {
        const status = presences[index];
        await client.editStatus(status.status, [{
            name: 'ES Safety',
            type: ActivityTypes.CUSTOM,
            state: status.message.replace('{users}', userCount()).replace('{guilds}', guildCount())
        }]);
        index = index >= presences.length - 1 ? 0 : index + 1;
    }, 120000);

    const staffToCache: StaffCache[] = [];
    const entries = [...client.staff.entries()];

    const process = async (userId: string) => {
        const entry = client.staff.get(userId)!;
        if (entry > 5) return;
        const user = await client.getUser(userId);
        staffToCache.push({ username: user.username, displayName: user.globalName || user.username, level: entry, id: userId });
    };

    const next = async (index: number) => {
        if (index >= entries.length) return;
        await process(entries[index][0]);
        setTimeout(async () => await next(index + 1), 500);
    };

    await next(0);
    setTimeout(async () => await redis.set(`es_config:safety-team`, JSON.stringify(new Map(staffToCache.entries()), replacer)), 500 * entries.length);
};
