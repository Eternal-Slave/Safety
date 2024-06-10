import { emojis } from '@/config';
import { updateGuild } from '@/store';
import confirmPrompt from '@/structures/confirmPrompt';
import { ButtonRun, Flags, IntInfo, IntType } from '@/types';
import { Permissions } from 'oceanic.js';
import { genConfigContent } from '../commands/config';

export const run: ButtonRun = async (client, interaction) => {
    if (!interaction.memberPermissions?.has(Permissions.MANAGE_GUILD))
        return interaction.reply({ content: client.replies('noManagePerms', interaction.guild?.name), flags: Flags.Ephemeral });

    const lines = [
        '## Are you sure you want to clear the safety config?\n',
        `${interaction.guild?.name} will immediately be opted out of safety alerts, and all configuration options will be reset to default.`
    ];

    const { int, success } = await confirmPrompt(interaction, lines.join(''), { time: 60000, noEdit: true });
    if (!success) return int.editParent({ content: `${emojis.cancel} Okay, safety config clear cancelled.`, components: [] });

    const guild = await updateGuild(interaction.guildID!, {
        $unset: { 'safety.alerts': '' },
        $set: { 'safety.autoBan': false, 'safety.mentions': [], 'safety.subscriptions': [] }
    });

    await int.editParent({ content: `${emojis.success} Cleared ${interaction.guild?.name}'s safety config.`, components: [] });
    await interaction.message.edit({ ...await genConfigContent(interaction, guild) });
};

export const info: IntInfo = {
    type: IntType.Button,
    id: 'btn.gctl.safety.clear'
};
