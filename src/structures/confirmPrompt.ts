import { ButtonInteraction, ChatInputCommandInteraction, Flags } from '@/types';
import { AnyInteractionChannel, ComponentTypes, Embed, InteractionTypes, Message, ModalSubmitInteraction, TextableChannel, Uncached } from 'oceanic.js';
import {buttonRow} from './component';
import { InteractionCollector } from 'oceanic-collectors';
import { randomBytes } from 'node:crypto';
import { emojis } from '@/config';

interface Reply {
    success: boolean;
    int: ButtonInteraction;
}

interface Opts {
    time: number;
    userId?: string;
    cancel?: string;
    noEdit?: boolean;
    confirm?: string;
    ephemeral?: boolean;
    response?: 'edit'|'message';
}

export default async (interaction: ChatInputCommandInteraction | ModalSubmitInteraction | ButtonInteraction, message: string|Embed, opts: Opts): Promise<Reply> => {
    return await new Promise<Reply>(async (resolve) => {
        const state = randomBytes(12).toString();

        const row = buttonRow([
            { label: opts.confirm ? opts.confirm : "I'm Sure", style: 4, id: `${state}-confirm` },
            { label: opts.cancel ? opts.cancel : 'Cancel', style: 2, id: `${state}-cancel` }
        ]);

        let msg: Message<Uncached | AnyInteractionChannel>|null;
        const contentOrEmbed = typeof message === 'string' ? { content: message } : { embeds: [message] };
        if (opts.response) switch (opts.response) {
            case 'edit': msg = await interaction.editOriginal({ components: [row], ...contentOrEmbed }); break;
            case 'message': msg = await (interaction.channel! as TextableChannel).createMessage({ components: [row], ...contentOrEmbed }); break;
        } else msg = (await interaction.reply({ components: [row], flags: !!opts.ephemeral ? Flags.Ephemeral : 0, ...contentOrEmbed })).message!;
        
        for (const c of row.components) c.disabled = true;
        const collector = new InteractionCollector(interaction.client, {
            message: msg,
            time: opts.time,
            channel: interaction.channel,
            componentType: ComponentTypes.BUTTON,
            filter: (i) => i.data.customID.startsWith(state),
            interactionType: InteractionTypes.MESSAGE_COMPONENT,
        });

        collector.on('collect', async (int) => {
            const notTarget = opts.userId && int.user.id !== opts.userId;
            const notSelf = !opts.userId && int.user.id !== interaction.user.id;
            if (notSelf || notTarget) return int.reply({ content: `${emojis.info} Hold up! This button is not meant for you.`, flags: Flags.Ephemeral });

            collector.stop('user');
            switch (int.data.customID) {
                case `${state}-confirm`: resolve({ success: true, int }); break;
                case `${state}-cancel`: resolve({ success: false, int }); break;
            };
        });

        collector.on('end', async (_, reason) => {
            if (!!opts.noEdit && reason === 'user') return;
            if (opts.response) switch (opts.response) {
                case 'message': await msg.edit({ components: [row] }).catch(() => {}); break;
                case 'edit': await interaction.editOriginal({ components: [row] }).catch(() => {}); break;
            } else await interaction.editOriginal({ components: [row] }).catch(() => {});
        });
    });
};
