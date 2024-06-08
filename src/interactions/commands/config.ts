import { getGuild, updateGuild } from '@/helpers';
import { buttonRow } from '@/structures/component';
import createEmbed from '@/structures/createEmbed';
import { ChannelSelectMenuInteraction, ChatCmdRun, ChatInputCommandInteraction, CmdInfo, GuildI } from '@/types';
import { ButtonStyles, Permissions } from 'oceanic.js';

export const genConfigContent = async (interaction: ChatInputCommandInteraction|ChannelSelectMenuInteraction, guild: GuildI) => {
    const logs = guild.safety.alerts ? interaction.guild?.channels.get(guild.safety.alerts) : null;
    if (guild.safety.alerts && !logs) guild = await updateGuild(interaction.guildID!, { $unset: { 'safety.alerts': '' } });

    const lines = [
        `Here you can manage and configure ES Safety for your server.\n`,
        "Here's a quick explanation of available config options:\n\n",
        '- Alerts: The channel where you will receive subscribed alerts.\n',
        `- Mentions: The roles or users ${interaction.client.user.username} will mention when sending alerts.\n`,
        '- Subscriptions: The type of alerts you want to receive (restriction types and flags).\n',
        `- Auto Ban: If ${interaction.client.user.username} should auto-ban users involved in subscribed alerts from ${interaction.guild?.name}.\n\n`,
        `**Auto Ban:** ${guild.safety.autoBan ? 'Enabled' : 'Disabled'}\n**Alerts Channel:** ${logs ? `<#${logs.id}>` : 'None'}\n\n`,
        `**Mentions:** ${guild.safety.mentions.length > 1 ? guild.safety.mentions.map((m) => `<@&${m}>`).join(', ') : 'None'}\n`,
        `**Subscriptions:** ${guild.safety.subscriptions.length > 1 ? guild.safety.subscriptions.join(', ') : 'None'}\n`
    ];

    const embed = await createEmbed({
        description: lines.join(''),
        title: `Config • ${interaction.guild?.name}`
    }, interaction.guildID);

    const row = buttonRow([
        { label: 'Set Alerts', style: guild.safety.alerts ? 1 : 2, id: 'btn.gctl.safety.alerts' },
        { label: 'Set Subscriptions', style: guild.safety.subscriptions.length > 1 ? 1 : 2, id: 'btn.gctl.safety.subscriptions' },
        { label: guild.safety.autoBan ? 'Disable Auto-Ban' : 'Enable Auto-Ban', style: guild.safety.autoBan ? 1 : 2, id: 'btn.gctl.safety.autoban' },
        { label: 'Clear Config', style: ButtonStyles.DANGER, id: 'btn.gctl.safety.clear' }
    ]);

    return { embeds: [embed], components: [row] };
};

export const run: ChatCmdRun = async (client, interaction) => {
    const guild = await getGuild(interaction.guildID!);
    if (!guild) return interaction.reply({ content: client.replies('unregistered', interaction.guild?.name) });
    else await interaction.reply({ ...await genConfigContent(interaction, guild) });
};

export const info: CmdInfo = {
    name: 'config',
    contexts: [0],
    integrationTypes: [0],
    defaultMemberPermissions: Permissions.MANAGE_GUILD,
    description: 'Manage and configure ES Safety for your server.'
};
