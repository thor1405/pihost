import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
  },
  customDomains: [String],
  framework: {
    type: String,
    default: 'static', // static, react, node, etc.
  },
  status: {
    type: String,
    enum: ['active', 'building', 'error'],
    default: 'active',
  },
  storageUsed: {
    type: Number, // in bytes
    default: 0,
  },
  bandwidthUsed: {
    type: Number, // in bytes
    default: 0,
  },
  deployments: [{
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed'] },
    size: { type: Number }
  }],
  // We'll use these later for GitHub integration
  repository: String,
  branch: String,
  envVariables: [{
    key: String,
    value: String,
  }]
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
