import Client from '@/Client';
import { ActivityTypes, SendStatuses } from 'oceanic.js';

interface Presence {
    message: string;
    status: SendStatuses;
}

const presences: Presence[] = [
    { status: 'online', message: 'Watching over the BDSM community...' }
];

export default async (client: Client) => {
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
};
