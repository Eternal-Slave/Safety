import { isInstalled } from '@/events/interactionCreate';
import { formatDate, name } from '@/helpers';
import { getProfile } from '@/store';
import createEmbed from '@/structures/createEmbed';
import { ChatCmdRun, CmdInfo, OptType } from '@/types';
import { Collection } from '@discordjs/collection';
import dayjs from 'dayjs';

const keyPermissions = {
    'Kick Members': 2n, 'Ban Members': 4n, 'Administrator': 8n, 'Manage Channels': 16n,
    'Manage Server': 32n, 'Manage Messages': 8192n, 'Mention Everyone': 131072n, 'Mute Members': 4194304n,
    'Deafen Members': 8388608n, 'Manage Nicknames': 134217728n, 'Manage Roles': 268435456n,
    'Manage Webhooks': 536870912n, 'Manage Expressions': 1073741824n, 'Moderate Members': 1099511627776n,
    'Create Expressions': 8796093022208n,
};

const formatRelative = (date: Date|null) => dayjs.utc().to(date);
const formatShort = (date: Date) => dayjs.utc(date).format('DD/MM/YYYY HH:mm');

export const run: ChatCmdRun = async (client, interaction) => {
    const user = interaction.data.options.getUser('user', true);
    const safety = await getProfile(user.id, true);
    let thumbnail = user.avatarURL();

    const lines = [
        `**ID:** ${user.id}\n**Display Name:** ${name(user)}\n`,
        `**Creation Date:** ${formatDate(user.createdAt)} [${formatRelative(user.createdAt)}]\n\n`
    ];

    if (isInstalled(interaction)) {
        let member = interaction.guild?.members.get(user.id);
        if (!member) member = await interaction.guild?.getMember(user.id);

        if (member) {
            const perms = [];
            thumbnail = member.avatarURL();
            for (const [perm, value] of Object.entries(keyPermissions)) if ((member.permissions.allow & value) !== BigInt(0)) perms.push(perm);
            const roles = member.roles.map((r) => interaction.guild!.roles.get(r)!).sort((r1, r2) => r2.position - r1.position).map((r) => `<@&${r.id}>`);

            lines.push(`**Nickname:** ${member.nick || 'None'}\n`);
            lines.push(`**Joined Date:** ${formatDate(member.joinedAt)} [${formatRelative(member.joinedAt)}]\n\n`);
            lines.push(`**Significant Permissions:**\n${perms.join(', ')}\n\n`);
            lines.push(`**Roles:**\n${roles.length > 0 ? roles.join(', ') : 'None'}\n\n`);
        };
    };

    if (safety && (safety.warns.length > 0 || safety.flags.size > 0 || safety.restrictions.size > 0)) {
        const warns = safety.warns.sort((i1, i2) => i2.issuedAt.valueOf() - i1.issuedAt.valueOf())
        .map((inf, index) => `**[${index + 1}]** (${formatShort(inf.issuedAt)}): ${inf.reason}`)
        const rest = new Collection(safety.restrictions).map((inf, id) => `**[${id.toUpperCase()}]** (${formatShort(inf.issuedAt)}): ${inf.reason}`);
        const flags = new Collection(safety.flags).map((inf, id) => {
            return `**[${id.toUpperCase()}]** (${formatShort(inf.issuedAt)} - ${inf.authority}): ${inf.reason}`
        });

        lines.push(`**Warns:**\n${warns.length > 0 ? warns.join('\n') : 'None'}\n\n`);
        lines.push(`**Restrictions:**\n${rest.length > 0 ? rest.join('\n') : 'None'}\n\n`);
        lines.push(`**Flags:**\n${flags.length > 0 ? flags.join('\n') : 'None'}`);
    } else lines.push(`${user.globalName || user.username} has no safety infractions.`);

    const embed = await createEmbed({
        thumbnail,
        space: true,
        description: lines.join(''),
        title: `About User • ${user.globalName || user.username}`
    });

    await interaction.reply({ embeds: [embed] });
};

export const info: CmdInfo = {
    name: 'whois',
    cooldown: 15,
    contexts: [0, 1, 2],
    integrationTypes: [0, 1],
    description: 'View another users safety profile and user information.',
    options: [
        {
            name: 'user',
            required: true,
            type: OptType.User,
            description: 'The user you want to view.'
        }
    ]
};
