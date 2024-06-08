import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { ChannelTypes, ComponentTypes, MessageActionRow, Permissions } from 'oceanic.js';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    const row: MessageActionRow = { type: ComponentTypes.ACTION_ROW, components: [{
        type: ComponentTypes.CHANNEL_SELECT,
        channelTypes: [ChannelTypes.GUILD_TEXT],
        placeholder: 'Select a safety alerts channel.',
        customID: `select.gctl.safety.alerts:${interaction.message.id}`
    }]};

    await interaction.reply({ components: [row] });
};

export const info: IntInfo = {
    type: IntType.Button,
    id: 'btn.gctl.safety.alerts'
};
