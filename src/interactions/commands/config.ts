import { capitalize } from '@/helpers';
import { getGuild, updateGuild } from '@/store';
import { buttonRow } from '@/structures/component';
import createEmbed from '@/structures/createEmbed';
import { ChatCmdRun, CmdInfo, GuildI } from '@/types';
import { ButtonStyles, CommandInteraction, ComponentInteraction, Permissions } from 'oceanic.js';

export const genConfigContent = async (interaction: CommandInteraction|ComponentInteraction, guild: GuildI) => {
    const logs = guild.safety.alerts ? interaction.guild?.channels.get(guild.safety.alerts) : null;
    if (guild.safety.alerts && !logs) guild = await updateGuild(interaction.guildID!, { $unset: { 'safety.alerts': '' } });
    const name = interaction.client.user.username;

    const lines = [
        `Here you can manage and configure ES Safety for your server.\n`,
        "Here's a quick explanation of available config options:\n\n",
        '- Subscriptions: The type of safety alerts you want to receive.\n',
        '- Alerts Channel: The channel where you will receive subscribed safety alerts.\n',
        `- Mentions: The roles or users ${name} will mention when sending safety alerts.\n`,
        `- Auto-Ban: A list of subscriptions where ${name} will auto-ban the target from this server.\n\n`,
        `**Mentions:** ${guild.safety.mentions.length > 0 ? guild.safety.mentions.map((m) => `<@&${m}>`).join(', ') : 'None'}\n`,
        `**Alerts Channel:** ${logs ? `<#${logs.id}>` : 'None'}\n\n**Auto-Ban:** `,
        `${guild.safety.autoBan.length > 0 ? guild.safety.autoBan.map((s) => capitalize(s)).join(', ') : 'None'}\n**Subscriptions`,
        `:** ${guild.safety.subscriptions.length > 0 ? guild.safety.subscriptions.map((s) => capitalize(s)).join(', ') : 'None'}`
    ];

    const embed = await createEmbed({
        description: lines.join(''),
        title: `Safety Config • ${interaction.guild?.name}`
    }, interaction.guildID);

    const row = buttonRow([
        { label: 'Set Alerts', style: guild.safety.alerts ? 1 : 2, id: 'btn.gctl.safety.alerts' },
        { label: 'Set Mentions', style: guild.safety.mentions.length > 0 ? 1 : 2, id: 'btn.gctl.safety.mentions' },
        { label: 'Set Auto-Ban', style: guild.safety.autoBan.length > 0 ? 1 : 2, id: 'btn.gctl.safety.auto-ban' },
        { label: 'Set Subscriptions', style: guild.safety.subscriptions.length > 0 ? 1 : 2, id: 'btn.gctl.safety.subscriptions' },
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
    cooldown: 15,
    contexts: [0],
    integrationTypes: [0],
    defaultMemberPermissions: Permissions.MANAGE_GUILD,
    description: 'Manage and configure ES Safety for your server.'
};
