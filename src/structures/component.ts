import {ButtonStyles, ComponentTypes, MessageActionRow, MessageComponent, StringSelectMenu, TextButton, URLButton} from "oceanic.js";

interface BtnBaseData {
	id?: string;
	label?: string;
	emoji?: string;
	disabled?: boolean;
}

type BtnData = (BtnBaseData & {
	url: string;
	style: ButtonStyles.LINK;
}) | (BtnBaseData & {
	url?: undefined;
	style: ButtonStyles;
})

export const buttonRow = (data: BtnData[]): MessageActionRow => ({
	type: ComponentTypes.ACTION_ROW,
	components: data.map((button) => ({
		customID: button.id,
		type: ComponentTypes.BUTTON,
		style: button.style,
		label: button.label,
		disabled: button.disabled,
		emoji: button.emoji ? { id: button.emoji } : undefined,
		url: button.style === ButtonStyles.LINK ? button.url : undefined,
	} as URLButton | TextButton))
});

export const stringSelectRow = (data: Omit<StringSelectMenu, 'type'>[]): MessageActionRow => ({
    type: ComponentTypes.ACTION_ROW,
    components: data.map((select) => ({
        ...select,
        type: ComponentTypes.STRING_SELECT
    }))
});

export const selectRow = (data: MessageComponent[]): MessageActionRow => ({
	type: ComponentTypes.ACTION_ROW,
	components: data
});
