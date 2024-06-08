import { emojis } from '@/config';
import { getGuild, updateGuild } from '@/helpers';
import { ChSelectRun } from '@/interfaces/Interaction';
import { Flags, IntInfo, IntType } from '@/types';
import { ChannelTypes, Permissions } from 'oceanic.js';
import { genConfigContent } from '../commands/config';

export const run: ChSelectRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    let guild = await getGuild(interaction.guildID!);
    if (!guild) return await interaction.editParent({ content: client.replies('unregistered', interaction.guild?.name), components: [] });
    await interaction.editParent({ content: `${emojis.loading} Updating alerts channel...`, components: [] });

    const channelId = interaction.data.values.getChannels(true)[0].id;
    const channel = interaction.guild?.channels.get(channelId);
    if (!channel) return interaction.editOriginal({ content: `${emojis.warn} The specified channel was not found or could not be fetched.` });
    if (channel.type !== ChannelTypes.GUILD_TEXT) return interaction.editOriginal({ content: `${emojis.warn} The specified channel is not a text channel.` });
    if (!channel.permissionsOf(client.user.id).has(...[Permissions.VIEW_CHANNEL, Permissions.SEND_MESSAGES]))
        return interaction.reply({ content: `${emojis.error} I don't have permission to send messages in ${channel.mention}, please check my permissions.` });

    guild = await updateGuild(interaction.guildID!, { $set: { 'safety.alerts': channelId } });
    await interaction.editOriginal({ content: `${emojis.success} Set the safety alerts channel to ${channel.mention}.` });
    await client.rest.channels.editMessage(interaction.channelID, interaction.data.customID.split(':').at(-1)!, {
        ...await genConfigContent(interaction, guild)
    }).catch(() => {});
};

export const info: IntInfo = {
    type: IntType.StrSelect,
    id: 'select.gctl.safety.alerts'
};
