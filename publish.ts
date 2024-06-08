import { getDir } from '@/helpers';
import Command, { CmdInfo } from '@/interfaces/Command';
import { readdirSync } from 'node:fs';
import { snakeCase } from 'change-case';
import { replacer } from '@/store';

const commands = new Map<string, CmdInfo>();
const path = `${getDir(import.meta.url)}/src/interactions/commands`;

readdirSync(path).filter((f) => f.endsWith('.js')).forEach(async (command) => {
    const { info }: Command = await import(`${path}/${command}`);
    commands.set(info.name, info);
});

interface AnyObject { [key: string]: any; }
const toSnakeCase = (obj: AnyObject): AnyObject => {
    if (typeof obj !== 'object' || !obj) return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [snakeCase(key), toSnakeCase(value)]));
};

setTimeout(() => {
    const commandInfo: any[] = [];
    commands.forEach((c) => {
        delete c.permissions;
        commandInfo.push(toSnakeCase(c));
    });

    // prettier-ignore
    fetch(`https://discord.com/api/v10/applications/${process.env.APP_ID}/commands`, {
        method: 'PUT',
        body: JSON.stringify(commandInfo, replacer),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${process.env.APP_TOKEN}`
        }
    })
    .then(async (res) => console.log(`Published all application commands with code ${res.status}.`))
    .catch((err) => console.log('An unexpected error has occurred\n', err));
}, 5000);
