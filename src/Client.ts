import { Collection } from '@discordjs/collection';
import { Member, Client as OceanicClient, User } from 'oceanic.js';
import Command from './interfaces/Command';
import { Interaction } from './types';
import lang, { LangKeys } from './lang';

export default class Client extends OceanicClient {
    public ready = false;
    public commands = new Collection<string, Command>();
    public interactions = new Collection<string, Interaction>();
    public replies = (key: LangKeys, custom?: string) => lang(this, key, custom);

    public staff = new Collection<string, number>([
        ['738746238874419220', 9], ['179044026077544448', 8],
        ['811190019528196156', 8]
    ]);


    public trustedGuilds = new Collection<string, string>([
        ['1222281807022657546', 'We are Degenerates']
    ]);

    public getUser = async (userId: string) => {
        let user: User | void = this.users.get(userId);
        if (!user) user = await this.rest.users.get(userId);
        return user;
    };

    public getMember = async (guildId: string|null, memberId: string) => {
        if (!guildId) return null;
        const guild = this.guilds.get(guildId);
        if (!guild) return null;
        let member: Member | null = guild.members.get(memberId) || null;
        if (!member) member = await this.rest.guilds.getMember(guildId, memberId).catch(() => {}) || null;
        return member;
    };
};
