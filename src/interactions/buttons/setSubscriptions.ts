import { stringSelectRow } from '@/structures/component';
import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { Permissions } from 'oceanic.js';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    const row = stringSelectRow([{
        minValues: 1,
        maxValues: 4,
        placeholder: 'Select some alert subscriptions below.',
        customID: `select.gctl.safety.subscriptions:${interaction.message.id}`,
        options: [
            { label: 'Full/Total Restrictions', value: 'full' },
            { label: 'BDSM Restrictions', value: 'bdsm' },
            { label: 'Report Restrictions', value: 'report' },
            { label: 'User Flags', value: 'flags' }
        ]
    }]);

    await interaction.reply({ components: [row] });
};

export const info: IntInfo = {
    type: IntType.Button,
    id: 'btn.gctl.safety.subscriptions'
};
