import Client from '@/Client';
import { ButtonInteraction, ChannelSelectMenuInteraction, StringSelectMenuInteraction } from '@/types';
import { ComponentInteraction, ComponentTypes, ModalSubmitInteraction } from 'oceanic.js';

export enum IntType {
    Modal = 1,
    Button = 2,
    StrSelect = 3,
    ChSelect = 4
};

export interface Interaction {
    info: IntInfo;
    run: BaseIntRun;
}

export interface IntInfo {
    id: string;
    type: IntType;
	permissions?: bigint[];
    authorization?: { brand?: true };
}

export interface ChSelectRun {
    (client: Client, interaction: ChannelSelectMenuInteraction): void;
}

export interface StrSelectRun {
    (client: Client, interaction: StringSelectMenuInteraction): void;
}

export interface ButtonRun {
	(client: Client, interaction: ComponentInteraction<ComponentTypes.BUTTON>): void;
}

export interface ModalRun {
	(client: Client, interaction: ModalSubmitInteraction): void;
}

interface BaseIntRun {
    (client: Client, interaction: ButtonInteraction|ModalSubmitInteraction|StringSelectMenuInteraction): void;
}
