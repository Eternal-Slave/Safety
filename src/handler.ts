import { readdirSync } from 'node:fs';
import { getDir } from './helpers';
import Command from './interfaces/Command';
import { join } from 'node:path';
import Client from './Client';

export default async (client: Client) => {
    // const interactionPath = `${getDir(import.meta.url)}/interactions`;
	const commandPath = `${getDir(import.meta.url)}/interactions/commands`;

	// prettier-ignore
    readdirSync(commandPath).filter((f) => f.endsWith('.js')).forEach(async (cmd) => {
        const command: Command = await import(join(commandPath, cmd));
        client.commands.set(command.info.name, command);
    });

	// prettier-ignore
	// for (const dir of readdirSync(interactionPath).filter((d) => d !== 'commands')) {
		// for (const int of readdirSync(join(interactionPath, dir)).filter((f) => f.endsWith('.js'))) {
			// const interaction: Interaction = await import(join(interactionPath, dir, int));
			// client.interactions.set(interaction.info.id, interaction);
		// };
	// };
};
