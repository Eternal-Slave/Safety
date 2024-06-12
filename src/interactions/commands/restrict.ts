import { emojis } from '@/config';
import safetyBroadcast from '@/library/safetyBroadcast';
import validateInfraction, { evidenceArgs } from '@/library/validateInfraction';
import { updateProfile } from '@/store';
import confirmPrompt from '@/structures/confirmPrompt';
import { ChatCmdRun, CmdInfo, OptType } from '@/types';

export const run: ChatCmdRun = async (client, interaction) => {
    const infraction = await validateInfraction(client, interaction);
    if (!infraction.valid) return interaction.reply({ content: infraction.message });

    const user = interaction.data.options.getUser('user', true);
    const type = interaction.data.options.getString('type', true);
    const undo = interaction.data.options.getString('undo') === 'true';
    const displayName = user.globalName || user.username;

    const confirmTxt = `Are you sure you want to ${undo ? `remove \`${type}\` from` : `add \`${type}\` to`} ${displayName}'s restrictions?`;
    const { int, success } = await confirmPrompt(interaction, confirmTxt, { time: 60000, noEdit: true });
    if (!success) return int.editParent({ content: `${emojis.cancel} Okay, restriction cancelled.`, components: [] });
    await int.editParent({ content: `${emojis.loading} Updating restrictions for ${displayName}...`, components: [] });

    if (undo) await updateProfile(user.id, { $unset: { [`restrictions.${type}`]: {} } });
    else await updateProfile(user.id, { $set: { [`restrictions.${type}`]: infraction.data } });
    await int.editOriginal({ content: `${emojis.success} ${undo ? `Removed \`${type}\` from` : `Added \`${type}\` to`} ${displayName}'s restrictions.` });
    if (type !== 'report') await safetyBroadcast(client, interaction, user, undo, { ...infraction.data, id: type, type: 'restriction' });
};

export const info: CmdInfo = {
    name: 'restrict',
    contexts: [0, 1, 2],
    integrationTypes: [0, 1],
    description: 'Restrict a users access to Eternal Slave and other bots on the network.',
    options: [
        {
            name: 'user',
            required: true,
            type: OptType.User,
            description: 'The user to restrict/unrestrict.'
        },
        {
            name: 'type',
            required: true,
            type: OptType.String,
            description: 'The restriction to add/remove.',
            choices: [
                { name: 'Full', value: 'full' },
                { name: 'BDSM', value: 'bdsm' },
                { name: 'Reports', value: 'report' }
            ]
        },
        ...evidenceArgs
    ]
};
