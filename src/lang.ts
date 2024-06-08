import Client from './Client';
import { emojis } from './config';

export type LangKeys = keyof typeof strings;
export default (client: Client, key: LangKeys, custom?: string): string => {
    let reply = strings[key];
    reply = reply
        .replace('{info}', emojis.info)
        .replace('{warn}', emojis.warn)
        .replace('{error}', emojis.error)
        .replace('{loading}', emojis.loading)
        .replace('{success}', emojis.success)
        .replace('{name}', client.user.username)
        .replace('{custom}', custom ? custom : 'err.unknown')
        .replace('{guildctl}', '</guildctl general:1197506563087274024>')
    return reply;
};

const strings = {
    noManagePerms: "You don't have permission to manage {custom}.",
    unregistered: "{custom}'s configuration was not found. Please use {guildctl} with Eternal Slave."
};
