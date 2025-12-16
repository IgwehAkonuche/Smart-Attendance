import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    verified: { type: Boolean, default: false },
    syncStatus: { type: String, enum: ['synced', 'pending'], default: 'synced' }
});

attendanceSchema.index({ location: '2dsphere' });


export default mongoose.model('Attendance', attendanceSchema);
