import { emojis } from '@/config';
import { getGuild, updateGuild } from '@/store';
import { Flags, IntInfo, IntType, StrSelectRun } from '@/types';
import { Permissions } from 'oceanic.js';
import { genConfigContent } from '../commands/config';

export const run: StrSelectRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    let guild = await getGuild(interaction.guildID!);
    if (!guild) return await interaction.editParent({ content: client.replies('unregistered', interaction.guild?.name), components: [] });
    await interaction.editParent({ content: `${emojis.loading} Updating safety alert subscriptions...`, components: [] });

    const subscriptions = interaction.data.values.getStrings();
    guild = await updateGuild(interaction.guildID!, { $set: { 'safety.subscriptions': subscriptions } });
    await interaction.editOriginal({ content: `${emojis.success} Updated safety alert subscriptions.` });
    await client.rest.channels.editMessage(interaction.channelID, interaction.data.customID.split(':').at(-1)!, {
        ...await genConfigContent(interaction, guild)
    }).catch(() => {});
};

export const info: IntInfo = {
    type: IntType.StrSelect,
    id: 'select.gctl.safety.subscriptions'
};
