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
    const displayName = user.globalName || user.username;

    const { int, success } = await confirmPrompt(interaction, `Are you sure you want to warn ${displayName}?`, { time: 60000, noEdit: true });
    if (!success) return int.editParent({ content: `${emojis.cancel} Okay, warn cancelled.`, components: [] });
    await int.editParent({ content: `${emojis.loading} Updating warns for ${displayName}...`, components: [] });

    await updateProfile(user.id, { $push: { warns: infraction.data } });
    await int.editOriginal({ content: `${emojis.success} Added warn to ${displayName}.` });
    await safetyBroadcast(client, interaction, user, false, { ...infraction.data, type: 'warn' });
};

export const info: CmdInfo = {
    name: 'warn',
    contexts: [0, 1, 2],
    integrationTypes: [0, 1],
    description: 'Warn a user for a violation of the ES Terms of Use or any other applicable reason.',
    options: [
        {
            name: 'user',
            required: true,
            type: OptType.User,
            description: 'The user to warn.'
        },
        ...evidenceArgs
    ]
};
