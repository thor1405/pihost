import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  status: {
    type: String,
    enum: ['queued', 'building', 'success', 'failed'],
    default: 'queued',
  },
  deployedUrl: String,
  commitHash: String,
  commitMessage: String,
  buildLogs: [String],
  duration: Number, // in seconds
}, {
  timestamps: true,
});

const Deployment = mongoose.model('Deployment', deploymentSchema);
export default Deployment;
