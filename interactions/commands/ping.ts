import { CmdInfo, ChatCmdRun } from '@/types';
import createEmbed from '@/structures/createEmbed';
import { isInstalled } from '@/events/interactionCreate';

export const run: ChatCmdRun = async (client, interaction) => {
    const appPing = Date.now() - interaction.createdAt.valueOf();
    const wsPing = isInstalled(interaction) ? interaction.guild!.shard.latency : client.shards.get(0)!.latency;

    const lines = [
        `⚡ Shard ${isInstalled(interaction) ? interaction.guild?.shard.id : 0} `,
        `(${Math.trunc((appPing + wsPing) / 2)}ms)\n💓 WS: ${wsPing}ms • ⏳ App: ${appPing}ms`
    ];

    const embed = await createEmbed({
        space: true,
        description: lines.join(''),
        title: `🏓 Ping • ${client.user.username}`,
    }, interaction.guildID);

    await interaction.reply({ embeds: [embed] });
};

export const info: CmdInfo = {
    name: 'ping',
    description: '🏓 Pong! View my ping.'
};
