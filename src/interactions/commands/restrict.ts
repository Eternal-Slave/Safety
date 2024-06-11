import { emojis } from '@/config';
import { getAuthority } from '@/helpers';
import evidenceArgs from '@/library/evidenceArgs';
import safetyBroadcast from '@/library/safetyBroadcast';
import { updateProfile } from '@/store';
import confirmPrompt from '@/structures/confirmPrompt';
import { ChatCmdRun, CmdInfo, Flags, OptType } from '@/types';
import dayjs from 'dayjs';

export const run: ChatCmdRun = async (client, interaction) => {
    const level = client.staff.get(interaction.user.id);
    if (!level || level < 5) return interaction.reply({
        flags: Flags.Ephemeral,
        content: 'This command can only be used by members of ES Safety or the ES Team.'
    });

    const undo = interaction.data.options.getString('undo') === 'true';
    const evidenceText = interaction.data.options.getString('text-evidence');

    const evidenceMedia = [
        interaction.data.options.getAttachment('media-evidence-1'),
        interaction.data.options.getAttachment('media-evidence-2'),
        interaction.data.options.getAttachment('media-evidence-3')
    ].filter((e) => !!e);

    if (!undo && !evidenceText && evidenceMedia.length < 1)
        return interaction.reply({ content: 'Please provide at least one field of evidence for the restriction.' });

    const user = interaction.data.options.getUser('user', true);
    const displayName = user.globalName || user.username;
    const type = interaction.data.options.getString('type', true);

    const confirmTxt = `Are you sure you want to ${undo ? `remove \`${type}\` from` : `add \`${type}\` to`} ${displayName}'s restrictions?`;
    const { int, success } = await confirmPrompt(interaction, confirmTxt, { time: 60000, noEdit: true });
    if (!success) return int.editParent({ content: `${emojis.cancel} Okay, cancelled restriction.`, components: [] });
    await int.editParent({ content: `${emojis.loading} Updating restrictions for ${displayName}...`, components: [] });

    const evidence: string[] = [];
    const reason = interaction.data.options.getString('reason', true);
    if (evidenceText) evidence.push(...evidenceText.split(',').map((e) => e.replace(/\\s/g, '')));
    for (const attachment of evidenceMedia) if (attachment) evidence.push(attachment.url);

    const restriction = { reason, evidence, issuedBy: interaction.user.id, issuedAt: dayjs.utc().toDate(), authority: getAuthority(level) };
    if (undo) await updateProfile(user.id, { $unset: { [`restrictions.${type}`]: {} } });
    else await updateProfile(user.id, { $set: { [`restrictions.${type}`]: restriction } });

    await int.editOriginal({ content: `${emojis.success} ${undo ? 'Removed' : 'Added'} restriction \`${type}\` to ${displayName}.` });
    if (type !== 'report') await safetyBroadcast(client, interaction, user, undo, { ...restriction, id: type, type: 'restriction' });
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
