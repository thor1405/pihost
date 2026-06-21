import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  plan: {
    type: String,
    enum: ['hobby', 'pro'],
    default: 'hobby',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  githubId: {
    type: String,
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
