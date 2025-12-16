import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    isActive: { type: Boolean, default: true },
    qrCodeData: { type: String, unique: true }, // Could be a dynamic string or token
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    radius: { type: Number, default: 50 }, // meters
});

sessionSchema.index({ location: '2dsphere' });

export default mongoose.model('Session', sessionSchema);
