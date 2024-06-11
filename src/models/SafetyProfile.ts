import { Schema, model } from 'mongoose';

export interface Infraction {
    reason: string;
    issuedAt: Date;
    issuedBy: string;
    authority: string;
    evidence: string[];
}

export interface SafetyProfileI {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    warns: Infraction[];
    flags: Map<string, Infraction>;
    restrictions: Map<string, Infraction>;
};

const infraction = {
    _id: false,
    reason: { required: true, type: String },
    issuedAt: { required: true, type: Date },
    issuedBy: { required: true, type: String },
    authority: { required: true, type: String },
    evidence: { required: true, type: [String] }
};

// prettier-ignore
const safetyProfileSchema = new Schema({
    _id: { required: true, type: String },
    warns: { required: true, type: Array, default: [] },
    flags: { required: true, type: Map, of: infraction, default: new Map() },
    restrictions: { required: true, type: Map, of: infraction, default: new Map() }
}, { _id: false, versionKey: false, timestamps: true });

export default model('safetyProfiles', safetyProfileSchema);
