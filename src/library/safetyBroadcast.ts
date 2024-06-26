import Client from '@/Client';
import { colors } from '@/config';
import { capitalize, defaultPerms, formatDate, name } from '@/helpers';
import { GuildI } from '@/models/Guild';
import { Infraction } from '@/models/SafetyProfile';
import { getGuild, redis } from '@/store';
import { buttonRow } from '@/structures/component';
import createEmbed from '@/structures/createEmbed';
import { ChatInputCommandInteraction } from '@/types';
import { ButtonStyles, ChannelTypes, Permissions, User } from 'oceanic.js';

interface Info extends Infraction {
    id?: string;
    type: 'warn'|'flag'|'restriction';
};

export default async (client: Client, interaction: ChatInputCommandInteraction, target: User, undo: boolean, info: Info) => {
    const lines = [
        `${info.type !== 'warn' ? `**${capitalize(info.type)}:** ${info.id!.toUpperCase()}\n` : ''}`,
        `**Issued At:** ${formatDate(info.issuedAt)} (UTC)\n\n**Target:** ${name(target, 2)}`,
        ` \n**${undo ? 'Removed' : 'Added'} By:** ${name(interaction.user, 2)} [${info.authority}]`,
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

        let row = null;
        if (!undo) {
            const isBanned = await client.rest.guilds.getBan(guild.id, target.id).catch(() => {});
            row = buttonRow([ { label: 'Ban User', style: ButtonStyles.DANGER, id: `btn.alert.ban:${target.id}`, disabled: !!isBanned } ]);
        };

        await channel.createMessage({ embeds: [embed], content: mentions ? `${mentions},` : undefined, components: row ? [row] : [] });
        if (!undo && subscription.safety.autoBan.includes((info.type + 's')) && channel.permissionsOf(client.user.id).has(Permissions.BAN_MEMBERS))
            await client.rest.guilds.createBan(guild.id, target.id, { reason: 'Automated Action: ES Safety Auto-Ban' });
    };

    const next = async (index: number) => {
        if (index >= subscriptions.length) return;
        await process(subscriptions[index]);
        setTimeout(async () => await next(index + 1), 1000);  
    };

    await next(0);
};
