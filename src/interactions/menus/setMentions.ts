import { emojis } from '@/config';
import { getGuild, updateGuild } from '@/store';
import { Flags, IntInfo, IntType, RoleSelectRun } from '@/types';
import { Permissions } from 'oceanic.js';
import { genConfigContent } from '../commands/config';

export const run: RoleSelectRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    let guild = await getGuild(interaction.guildID!);
    if (!guild) return await interaction.editParent({ content: client.replies('unregistered', interaction.guild?.name), components: [] });
    await interaction.editParent({ content: `${emojis.loading} Updating safety alert mentions...`, components: [] });

    const mentions = interaction.data.values.raw;
    guild = await updateGuild(interaction.guildID!, { $set: { 'safety.mentions': mentions } });
    await interaction.editOriginal({ content: `${emojis.success} Updated safety alert mentions.` });
    await client.rest.channels.editMessage(interaction.channelID, interaction.data.customID.split(':').at(-1)!, {
        ...await genConfigContent(interaction, guild)
    }).catch(() => {});
};

export const info: IntInfo = {
    type: IntType.RoleSelect,
    id: 'select.gctl.safety.mentions'
};
