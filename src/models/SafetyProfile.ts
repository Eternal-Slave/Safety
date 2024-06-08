import { Schema, model } from 'mongoose';

interface RestrictionOrFlag {
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
    flags: Map<string, RestrictionOrFlag>;
    restrictions: Map<string, RestrictionOrFlag>;
};

const restrictionOrFlag = {
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
    flags: { required: true, type: Map, of: restrictionOrFlag, default: new Map() },
    restrictions: { required: true, type: Map, of: restrictionOrFlag, default: new Map() }
}, { _id: false, versionKey: false, timestamps: true });

export default model('safetyProfiles', safetyProfileSchema);
