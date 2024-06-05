import Client from '@/Client';
import { redis } from '@/app';
import { defaultPerms, getPermNames, truncateString } from '@/helpers';
import { emojis } from '@/library/assets';
import { Flags } from '@/types';
import dayjs from 'dayjs';
import { AnyInteractionGateway, CommandInteraction, ComponentInteraction, TextableChannel } from 'oceanic.js';

export const isInstalled = (interaction: CommandInteraction|ComponentInteraction) => {
    return typeof interaction.authorizingIntegrationOwners['0'] === 'string' && interaction.authorizingIntegrationOwners['0'] !== '0';
};

export const checkPerms = async (client: Client, interaction: CommandInteraction|ComponentInteraction, perms: bigint[], commandPerms?: bigint[]) => {
    const me = await client.getMember(interaction.guildID, client.user.id);

    const lines = (perms: bigint[], mention?: string) => [
        `${emojis.error} I don't have the required permissions to do this. Please make sure my role has the following my role `,
        `has the following ${mention ? `permissions in ${mention}` : 'global permissions'}:\n\`\`\`txt\n${getPermNames(perms)}\n\`\`\``,
    ];

    if (commandPerms) perms = [...perms, ...commandPerms];
    if (!me?.permissions.has(...perms)) return truncateString(lines(perms).join(''));
    if (interaction.channel instanceof TextableChannel && !interaction.channel.permissionsOf(client.user.id).has(...perms))
        return truncateString(lines(perms, interaction.channel.mention).join(''));
};

export default async (client: Client, interaction: AnyInteractionGateway) => {
    if (interaction.isAutocompleteInteraction()) {
        const cmd = client.commands.get(interaction.data.name);
        if (cmd?.autoRun) cmd.autoRun(client, interaction);
    };

    if (interaction.isCommandInteraction() && interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.data.name);
        if (!command) return;
        
        if (command.info.cooldown) {
            const now = dayjs.utc();
            const cooldown = await redis.get(`es_cooldown:cmd:${command.info.name}:${interaction.user.id}`);

            if (cooldown) if (now.isBefore(cooldown)) return interaction.reply({
                flags: Flags.Ephemeral,
                content: `${emojis.info} This command is on cooldown for you, please try again ${now.to(cooldown)}.`
            }); else await redis.del(`es_cooldown:cmd:${command.info.name}:${interaction.user.id}`);
            await redis.set(`es_cooldown:cmd:${command.info.name}:${interaction.user.id}`, now.add(command.info.cooldown, 's').toISOString());
        };

        if (isInstalled(interaction)) {
            const error = await checkPerms(client, interaction, defaultPerms, command.info.permissions);
            if (error) return interaction.reply({ content: error });
        };

        command.run(client, interaction);
    };
};
