import Client from '@/Client';
import { isInstalled } from '@/events/interactionCreate';
import { Infraction } from '@/models/SafetyProfile';
import { ChatInputCommandInteraction, OptType } from '@/types';
import dayjs from 'dayjs';
import { Permissions } from 'oceanic.js';

const noPerms = 'This command can only be used by members of ES Safety or the ES Team.';
type Reply = ({ valid: true; data: Infraction; }) | ({ valid: false; message: string; });
export default async (client: Client, interaction: ChatInputCommandInteraction, trusted: boolean = false): Promise<Reply> => {
    let authority = null;
    const level = client.staff.get(interaction.user.id);

    if (trusted && !level && isInstalled(interaction)) {
        const trustedGuild = client.trustedGuilds.get(interaction.guildID!);
        if (!trustedGuild) return { valid: false, message: noPerms };
        if (!interaction.memberPermissions?.has(...[Permissions.BAN_MEMBERS, Permissions.KICK_MEMBERS, Permissions.MODERATE_MEMBERS]))
            return { valid: false, message: `This command can only be used by moderators or admins of ${interaction.guild?.name}.` };
        authority = trustedGuild;
    };

    if (level && !authority) authority = level === 5 ? 'ES Safety' : level > 5 ? 'ES Team' : null;
    if (!authority) return { valid: false, message: noPerms };

    const undo = interaction.data.options.getString('undo') === 'true';
    const evidenceText = interaction.data.options.getString('text-evidence');

    const evidenceMedia = [
        interaction.data.options.getAttachment('media-evidence-1'),
        interaction.data.options.getAttachment('media-evidence-2'),
        interaction.data.options.getAttachment('media-evidence-3')
    ].filter((e) => !!e);

    if (!undo && !evidenceText && evidenceMedia.length < 1)
        return { valid: false, message: 'Please provide at least one field of evidence for the restriction.' };

    const evidence: string[] = [];
    const reason = interaction.data.options.getString('reason', true);
    for (const attachment of evidenceMedia) if (attachment) evidence.push(attachment.url);
    if (evidenceText) evidence.push(...evidenceText.split(',').map((e) => e.replace(/\\s/g, '')));

    return { valid: true, data: {
        reason,
        evidence,
        authority,
        issuedBy: interaction.user.id,
        issuedAt: dayjs.utc().toDate()
    } };
};

export const evidenceArgs = [
    {
        name: 'reason',
        required: true,
        type: OptType.String,
        description: 'The reason for the warn/flag/restriction.'
    },
    {
        name: 'text-evidence',
        required: false,
        maxLength: 1000,
        type: OptType.String,
        description: 'A comma separated list of links/URLs of evidence for the warn/flag/restriction.'
    },
    {
        name: 'media-evidence-1',
        required: false,
        type: OptType.Attachment,
        description: 'A file/media attachment of evidence for the warn/flag/restriction.'
    },
    {
        name: `media-evidence-2`,
        required: false,
        type: OptType.Attachment,
        description: 'A file/media attachment of evidence for the warn/flag/restriction.'
    },
    {
        name: 'media-evidence-3',
        required: false,
        type: OptType.Attachment,
        description: 'A file/media attachment of evidence for the warn/flag/restriction.'
    },
    {
        name: 'undo',
        required: false,
        type: OptType.String,
        choices: [{ name: 'Yes', value: 'true' }],
        description: 'Should the warn/flag/restriction be removed from the user instead of added?'
    }
];