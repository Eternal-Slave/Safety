// This file does not contain the entire ES BDSM Profile schema.
// It only includes data that ES Safety needs to access on a users profile.

import { genDbId } from '@/helpers';
import { model, Schema } from 'mongoose';

interface SafetyRestrict {
	reason: string;
	issuedAt: Date;
	issuedBy: string;
	authority: string;
}

export interface Safety {
	full?: SafetyRestrict;
	bdsm?: SafetyRestrict;
	report?: SafetyRestrict;
}

export interface ProfileI {
	_id: number;
	user: string;
	safety: Safety;
	createdAt: Date;
	updatedAt: Date;
}

const safetyRestrict = {
	_id: false,
	reason: { required: true, type: String },
	issuedAt: { required: true, type: Date },
	issuedBy: { required: true, type: String },
	authority: { required: true, type: String }
};

// prettier-ignore
const profileSchema = new Schema<ProfileI>({
	_id: { type: Number, default: () => genDbId(10) },
	user: { required: true, type: String },
	safety: {
		full: { required: false, type: safetyRestrict },
		bdsm: { required: false, type: safetyRestrict },
		report: { required: false, type: safetyRestrict }
	}
}, { _id: false, versionKey: false, timestamps: true } );

export default model('profiles', profileSchema);
