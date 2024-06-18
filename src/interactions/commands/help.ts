import createEmbed from '@/structures/createEmbed';
import { ChatCmdRun, CmdInfo } from '@/types';

export const run: ChatCmdRun = async (client, interaction) => {
    const displayName = interaction.member ? interaction.member.displayName : interaction.user.globalName || interaction.user.username;

    const lines = [
        `ES Safety is a helper bot designed to extend the functionality of Eternal Slave.\n`,
        'Using ES Safety you can keep track of bad or harmful users across BDSM communities.\n\n',
        "To report a user or server for a violation of Discord's policies or the ES Terms of Use use ",
        '</report user:1249265227040555050> or </report server:1249265227040555050> with Eternal Slave.\n\n',
        `To check if a user has any safety infractions, use </whois:> and specify the user.\n\n`,
        'You can use </config:> to configure safety alerts for your server. You can configure the alerts channel',
        ', which roles to mention when an alert is published, which alerts you want to subscribe to, and if you',
        'want to auto-ban users targeted by alerts. </config:> will have a better description of the commands.'
    ];

    const embed = await createEmbed({
        space: true,
        description: lines.join(''),
        title: `👋 Welcome to ES Safety ${displayName}`
    }, interaction.guildID);

    await interaction.reply({ embeds: [embed] });
};

export const info: CmdInfo = {
    name: 'help',
    contexts: [0, 1, 2],
    integrationTypes: [0, 1],
    description: 'Learn more about me, including my features and tools to keep BDSM safer.'
};
