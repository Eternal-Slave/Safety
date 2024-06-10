import Client from '@/Client';
import { colors } from '@/config';
import { defaultPerms, getAuthority, name } from '@/helpers';
import { GuildI } from '@/models/Guild';
import { RestrictionOrFlag } from '@/models/SafetyProfile';
import { getGuild, redis } from '@/store';
import createEmbed from '@/structures/createEmbed';
import { ChatInputCommandInteraction } from '@/types';
import dayjs from 'dayjs';
import { ChannelTypes, User } from 'oceanic.js';

interface Info extends RestrictionOrFlag {
    id: string;
    type: 'flag'|'restriction';
};

export default async (client: Client, interaction: ChatInputCommandInteraction, target: User, revoke: boolean, info: Info) => {
    const level = client.staff.get(interaction.user.id);

    const lines = [
        `**${info.type === 'flag' ? 'Flag' : 'Restriction'}:** ${info.id.toUpperCase()}\n**Issued At:**`,
        ` ${dayjs.utc(info.issuedAt).format('MMMM Do, YYYY @ HH:mm')} (UTC)\n\n**Target:** ${name(target, 2)}`,
        ` \n**${revoke ? 'Removed' : 'Added'} By:** ${name(interaction.user, 2)} [${getAuthority(level)}]`,
        ` \n\n**Reason:**\n${info.reason}${!revoke ? `\n\n**Evidence:**\n${info.evidence.join('\n')}` : ''}`
    ];

    const embed = await createEmbed({
        description: lines.join(''),
        color: revoke ? colors.green : colors.red,
        title: `User ${info.type === 'flag' ? 'Flag' : 'Restriction'} ${revoke ? 'Removed' : 'Added'}`
    });

    const subscriptionsRaw = await redis.smembers(`es_safety_subscriptions`);
    // prettier-ignore
    let subscriptions = await Promise.all(subscriptionsRaw.map((sub) => new Promise<GuildI>(async (resolve) => resolve((await getGuild(sub))!))));
    subscriptions = subscriptions.filter((s) => s.safety.subscriptions.includes(info.id) && client.guilds.has(s.guild));

    const process = async (subscription: GuildI) => {
        const guild = client.guilds.get(subscription.guild);
        if (!guild) return;
        const channel = guild.channels.get(subscription.safety.alerts!);
        if (!channel || channel.type !== ChannelTypes.GUILD_TEXT || !channel.permissionsOf(client.user.id).has(...defaultPerms)) return;
        const mentions = subscription.safety.mentions.length > 0 ? subscription.safety.mentions.map((r) => `<@&${r}>`).join(', ') : undefined;
        await channel.createMessage({ embeds: [embed], content: `${mentions},` });
        if (subscription.safety.autoBan) await client.rest.guilds.createBan(guild.id, target.id, { reason: 'Automated Action: ES Safety Auto-Ban' });
    };

    const next = async (index: number) => {
        if (index >= subscriptions.length) return;
        await process(subscriptions[index]);
        setTimeout(async () => await next(index + 1), 1000);  
    };

    await next(0);
};
