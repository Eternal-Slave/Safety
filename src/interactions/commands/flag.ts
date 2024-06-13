import { emojis } from '@/config';
import safetyBroadcast from '@/library/safetyBroadcast';
import validateInfraction, { evidenceArgs } from '@/library/validateInfraction';
import { updateProfile } from '@/store';
import confirmPrompt from '@/structures/confirmPrompt';
import { ChatCmdRun, CmdInfo, OptType } from '@/types';

export const run: ChatCmdRun = async (client, interaction) => {
    const infraction = await validateInfraction(client, interaction, true);
    if (!infraction.valid) return interaction.reply({ content: infraction.message });

    const user = interaction.data.options.getUser('user', true);
    const flag = interaction.data.options.getString('flag', true);
    const undo = interaction.data.options.getString('undo') === 'true';
    const displayName = user.globalName || user.username;

    const confirmTxt = `Are you sure you want to ${undo ? `remove \`${flag}\` from` : `add \`${flag}\` to`} ${displayName}'s flags?`;
    const { int, success } = await confirmPrompt(interaction, confirmTxt, { time: 60000, noEdit: true });
    if (!success) return int.editParent({ content: `${emojis.cancel} Okay, flag cancelled.`, components: [] });
    await int.editParent({ content: `${emojis.loading} Updating restrictions for ${displayName}...`, components: [] });

    if (undo) await updateProfile(user.id, { $unset: { [`flags.${flag}`]: {} } });
    else await updateProfile(user.id, { $set: { [`flags.${flag}`]: infraction.data } });
    await int.editOriginal({ content: `${emojis.success} ${undo ? `Removed \`${flag}\` from` : `Added \`${flag}\` to`} ${displayName}'s flags.` });
    await safetyBroadcast(client, interaction, user, undo, { ...infraction.data, id: flag, type: 'flag' });
};

export const info: CmdInfo = {
    name: 'flag',
    contexts: [0, 1, 2],
    integrationTypes: [0, 1],
    description: 'Update a users flags on the ES network.',
    options: [
        {
            name: 'user',
            required: true,
            type: OptType.User,
            description: 'The user to flag/unflag.'
        },
        {
            name: 'flag',
            required: true,
            type: OptType.String,
            description: 'The flag to add/remove.',
            choices: [
                { name: 'Minor', value: 'minor' }
            ]
        },
        ...evidenceArgs
    ]
};
