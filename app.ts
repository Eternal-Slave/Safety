import { connect } from 'mongoose';
import Client from './Client';
import { parseWebhookURL, truncateString } from './helpers';
import Redis from 'ioredis';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import interactionCreate from './events/interactionCreate';
import clientReady from './events/clientReady';
import handler from './handler';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
// prettier-ignore
dayjs.updateLocale('en', { relativeTime: { ...dayjs.Ls.en.relativeTime, s: '%d seconds', m: '1 minute', mm: '%d minutes', }});

const client = new Client({
    auth: `Bot ${process.env.APP_TOKEN}`,
    gateway: { intents: 47, maxShards: 'auto' },
    allowedMentions: { users: true, roles: true, repliedUser: true },
    collectionLimits: { auditLogEntries: 0, stickers: 0, integrations: 0, groupChannels: 0, scheduledEvents: 0, autoModerationRules: 0 }
});

await handler(client);
export const redis = new Redis(process.env.REDIS_URL!);
await connect(process.env.MONGO_URL!, { dbName: process.argv.includes('--dev') ? 'dev' : 'bot' }).then(() => {})
.catch(() => console.error('Connection to MongoDB failed! Please check the MONGO_URL env variable.'));

client.on('ready', () => clientReady(client));
client.on('interactionCreate', (...params) => interactionCreate(client, ...params));
client.on('shardReady', (shard) => console.log(`[SHARD ${shard}] Connected to Discord.`));
client.on('shardDisconnect', (_err, shard) => console.log(`[SHARD ${shard}] Disconnected from Discord.`));

const handleError = async (error: Error|string) => {
    console.error(error);
    const wh = parseWebhookURL(process.env.ERROR_WEBHOOK!);
    if (!wh) return;
    let txt = '';
    if (typeof error === 'string') txt = error;
    if (error instanceof Error) {
        txt = `[${error.name}]: ${error.message}`;
        if (error.cause) txt = txt + `\n\n\`${error.cause}\``;
        if (error.stack) txt = txt + `\n\n\`\`\`txt\n${error.stack}\n\`\`\``;
    };
    client.rest.webhooks.execute(wh.id, wh.token, { content: truncateString(txt) });
    if ((await redis.get(`es_config:exitOnError`)) === 'true') process.exit(1);
};

client.on('error', handleError);
process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

client.connect();
