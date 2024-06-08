import { selectRow } from '@/structures/component';
import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { ComponentTypes, Permissions } from 'oceanic.js';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    const row = selectRow([{
        minValues: 1,
        maxValues: 5,
        type: ComponentTypes.ROLE_SELECT,
        placeholder: 'Select some roles to mention with alerts.',
        customID: `select.gctl.safety.mentions:${interaction.message.id}`
    }]);

    await interaction.reply({ components: [row] });
};

export const info: IntInfo = {
    type: IntType.Button,
    id: 'btn.gctl.safety.mentions'
};
