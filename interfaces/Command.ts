import Client from '@/Client';
import { ChatInputCommandInteraction, OptType } from '@/types';
import {
	AnyInteractionChannel, AutocompleteInteraction, ChannelTypes,
	CommandInteraction, InteractionTypes,
	Uncached,
} from "oceanic.js";

export default interface Command {
	run: CmdRun;
	info: CmdInfo;
	autoRun?: CmdAutoRun;
}

interface Choice {
	name: string;
	value: string | number;
}

type InfoBase = {
	name: string;
	cooldown?: number;
	options?: Options[];
	permissions?: bigint[];
	defaultMemberPermissions?: bigint;
};

type OptionsBase = {
	name: string;
	options?: Options[];
	description: string;
	autocomplete?: boolean;
	channelTypes?: ChannelTypes[];
};

// prettier-ignore
export type CmdInfo = | (InfoBase & {
	type?: InteractionTypes;
	description: string;
}) | (InfoBase & {
	type: 2 | 3;
	description?: string;
});

// prettier-ignore
type Options = | (OptionsBase & {
	required?: boolean;
	type: 1 | 2;
}) | (OptionsBase & {
	type: OptType;
	required: boolean;
	choices?: Choice[];
	minValue?: number;
	maxValue?: number;
	minLength?: number;
	maxLength?: number;
});

export type CmdAutoRun = { (client: Client, interaction: AutocompleteInteraction): void };
export type ChatCmdRun = {(client: Client, interaction: ChatInputCommandInteraction): void};
export type CmdRun = { (client: Client, interaction: CommandInteraction<AnyInteractionChannel | Uncached>): void };
