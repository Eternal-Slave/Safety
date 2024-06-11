import Client from '@/Client';
import { colors } from '@/config';
import { capitalize, defaultPerms, getAuthority, name } from '@/helpers';
import { GuildI } from '@/models/Guild';
import { Infraction } from '@/models/SafetyProfile';
import { getGuild, redis } from '@/store';
import createEmbed from '@/structures/createEmbed';
import { ChatInputCommandInteraction } from '@/types';
import dayjs from 'dayjs';
import { ChannelTypes, User } from 'oceanic.js';

interface Info extends Infraction {
    id?: string;
    type: 'warn'|'flag'|'restriction';
};

export default async (client: Client, interaction: ChatInputCommandInteraction, target: User, undo: boolean, info: Info) => {
    const level = client.staff.get(interaction.user.id);

    const lines = [
        `${info.type !== 'warn' ? `**${capitalize(info.type)}:** ${info.id!.toUpperCase()}\n` : ''}**Issued At:**`,
        ` ${dayjs.utc(info.issuedAt).format('MMMM Do, YYYY @ HH:mm')} (UTC)\n\n**Target:** ${name(target, 2)}`,
        ` \n**${undo ? 'Removed' : 'Added'} By:** ${name(interaction.user, 2)} [${getAuthority(level)}]`,
        ` \n\n**Reason:**\n${info.reason}${!undo ? `\n\n**Evidence:**\n${info.evidence.join('\n')}` : ''}`
    ];

    const embed = await createEmbed({
        description: lines.join(''),
        title: `User ${capitalize(info.type)} ${undo ? 'Removed' : 'Added'}`,
        color: undo ? colors.green : info.type === 'warn' ? colors.orange : colors.red
    });

    const subscriptionsRaw = await redis.smembers(`es_config:safety_subscriptions`);
    // prettier-ignore
    let subscriptions = await Promise.all(subscriptionsRaw.map((sub) => new Promise<GuildI>(async (resolve) => resolve((await getGuild(sub))!))));
    subscriptions = subscriptions.filter((s) => s.safety.subscriptions.includes((info.type + 's')) && client.guilds.has(s.guild));

    const process = async (subscription: GuildI) => {
        const guild = client.guilds.get(subscription.guild);
        if (!guild) return;
        const channel = guild.channels.get(subscription.safety.alerts!);
        if (!channel || channel.type !== ChannelTypes.GUILD_TEXT || !channel.permissionsOf(client.user.id).has(...defaultPerms)) return;
        const mentions = subscription.safety.mentions.length > 0 ? subscription.safety.mentions.map((r) => `<@&${r}>`).join(', ') : undefined;
        await channel.createMessage({ embeds: [embed], content: mentions ? `${mentions},` : undefined });
        if (subscription.safety.autoBan.includes((info.type + 's')))
            await client.rest.guilds.createBan(guild.id, target.id, { reason: 'Automated Action: ES Safety Auto-Ban' });
    };

    const next = async (index: number) => {
        if (index >= subscriptions.length) return;
        await process(subscriptions[index]);
        setTimeout(async () => await next(index + 1), 1000);  
    };

    await next(0);
};
