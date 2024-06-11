import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { ComponentTypes, Permissions } from 'oceanic.js';
import { selectRow } from '@/structures/component';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    const row = selectRow([{
        minValues: 1,
        maxValues: 3,
        type: ComponentTypes.STRING_SELECT,
        placeholder: 'Select some subscriptions to auto-ban below.',
        customID: `select.gctl.safety.auto-bans:${interaction.message.id}`,
        options: [
            { label: 'Restrictions', value: 'restrictions' },
            { label: 'User Flags', value: 'flags' },
            { label: 'User Warns', value: 'warns' }
        ]
    }]);

    await interaction.reply({ components: [row] });
};

export const info: IntInfo = {
    type: IntType.Button,
    id: 'btn.gctl.safety.auto-ban'
};
