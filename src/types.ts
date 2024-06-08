import { AnyInteractionChannel, ApplicationCommandTypes, CommandInteraction, ComponentInteraction, ComponentTypes, Uncached } from 'oceanic.js';

export enum Flags {
    Ephemeral = Number(1 << 6)
};

export enum OptType {
    SubCommand = 1,
    SubCommandGroup,
    String,
    Integer,
    Boolean,
    User,
    Channel,
    Role,
    Mentionable,
    Number,
    Attachment
};

export { GuildI } from '@/models/Guild';
export { SafetyProfileI } from '@/models/SafetyProfile';
export { ChatCmdRun, CmdInfo, CmdAutoRun } from '@/interfaces/Command';
export { IntType, ModalRun, IntInfo, ButtonRun, StrSelectRun, Interaction } from '@/interfaces/Interaction';

export type ButtonInteraction = ComponentInteraction<ComponentTypes.BUTTON>;
export type StringSelectMenuInteraction = ComponentInteraction<ComponentTypes.STRING_SELECT>;
export type ChatInputCommandInteraction = CommandInteraction<AnyInteractionChannel | Uncached, ApplicationCommandTypes.CHAT_INPUT>;
