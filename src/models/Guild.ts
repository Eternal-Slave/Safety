// This is only a portion of the ES Guild schema.
// Only relevant data to ES Safety is available here.

import { Schema, model } from 'mongoose';

export interface GuildI {
    _id: number;
    guild: string;
    safety: {
        alerts?: string;
        autoBan: boolean;
        mentions: string[];
        subscriptions: string[];
    };
}

// prettier-ignore
const guildSchema = new Schema<GuildI>({
    _id: { required: true, type: Number },
    guild: { required: true, type: String },
    safety: {
        alerts: { required: false, type: String },
        autoBan: { required: true, type: Boolean, default: false },
        mentions: { required: true, type: [String], default: [] },
        subscriptions: { required: true, type: [String], default: [] }
    }
}, { _id: false, versionKey: false, timestamps: true });

export default model('guilds', guildSchema);
