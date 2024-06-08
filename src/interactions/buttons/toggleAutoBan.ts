import { emojis } from '@/config';
import { getGuild, updateGuild } from '@/store';
import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { Permissions } from 'oceanic.js';
import { genConfigContent } from '../commands/config';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    let guild = await getGuild(interaction.guildID!);
    if (!guild) return await interaction.editParent({ content: client.replies('unregistered', interaction.guild?.name), components: [] });

    guild = await updateGuild(interaction.guildID!, { $set: { 'safety.autoBan': !guild.safety.autoBan } });
    await interaction.reply({ content: `${emojis.success} ${guild.safety.autoBan ? 'Enabled' : 'Disabled'} user auto-banning for subscribed alerts.` });
    await interaction.message.edit({ ...await genConfigContent(interaction, guild) }).catch(() => {});
};

export const info: IntInfo = {
    type: IntType.Button,
    id: 'btn.gctl.safety.autoban'
};
