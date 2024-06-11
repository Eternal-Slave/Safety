import { OptType } from '@/types';

export default [
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
