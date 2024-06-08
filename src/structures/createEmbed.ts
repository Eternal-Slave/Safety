import { sanitize, truncateString } from '@/helpers';
import { redis } from '@/store';
import { Embed, EmbedField, EmbedImage } from 'oceanic.js';

export interface EmbedData {
    url?: string;
    image?: EmbedImage;
    title?: string;
    space?: boolean;
    thumbnail?: string;
    timestamp?: string;
    description?: string;
    fields?: EmbedField[];
    color?: string | number;
    author?: {
        name: string;
        icon?: string;
    };
    footer?: {
        text: string;
        icon?: string;
    }
}

export default async (data: EmbedData, guildId?: string|null): Promise<Embed> => {
    let color = 0xfaff6d;
    let description = '';

    if (guildId) {
        const config = await redis.exists(`es_guild:${guildId}`) ? JSON.parse((await redis.get(`es_guild:${guildId}`))!) : null;
        if (config?.color) color = config.color;
    };

    if (typeof data.color === 'number') color = data.color;
    if (typeof data.color === 'string') color = parseInt(data.color.replace('#', '0x'));
    if (data.title) description = `### ${data.title}${data.space ? '\nㅤ\n' : '\n'}`;
    if (data.description) description = description + data.description;

    return {
        color,
        url: data.url,
        fields: data.fields,
        timestamp: data.timestamp ? data.timestamp : undefined,
        description: truncateString(sanitize(description), 4096),
        thumbnail: data.thumbnail ? { url: data.thumbnail } : undefined,
        author: data.author ? { name: data.author.name, iconURL: data.author.icon } : undefined,
        footer: !!data.footer ? { text: data.footer.text, iconURL: data.footer.icon } : undefined,
    };
};
