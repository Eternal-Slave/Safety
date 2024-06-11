import { evidenceArgs } from '@/library/validateInfraction';
import { ChatCmdRun, CmdInfo, OptType } from '@/types';

export const run: ChatCmdRun = async (client, interaction) => {
    
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
