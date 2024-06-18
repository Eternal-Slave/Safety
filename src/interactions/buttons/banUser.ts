import { emojis } from '@/config';
import { buttonRow } from '@/structures/component';
import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { ButtonStyles, Permissions } from 'oceanic.js';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(...[Permissions.MANAGE_GUILD, Permissions.BAN_MEMBERS]))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    if (!interaction.guild?.permissionsOf(client.user.id).has(Permissions.BAN_MEMBERS))
        return interaction.reply({ content: `${emojis.error} I do not have permission to ban the specified user.` });

    const target = interaction.data.customID.split(':').at(-1)!;
    await interaction.guild?.createBan(target, { reason: `Admin Action: User banned for safety infraction by @${interaction.user.username}` })
    .then(() => interaction.reply({ content: `${emojis.success} The specified user was banned.` }))
    .catch(() => interaction.reply({ content: `${emojis.error} I was unable to ban the specified user.` }));
    
    await interaction.message.edit({ components: [buttonRow([ { label: 'Ban User', style: ButtonStyles.DANGER, disabled: true } ])] }).catch(() => {});
};

export const info: IntInfo = {
    id: 'btn.alert.ban',
    type: IntType.Button
};
