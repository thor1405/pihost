import { useState } from 'react';
import { Settings as SettingsIcon, Save, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Profile Information
          </h2>
          <p className="text-sm text-textMuted mt-1">Update your account details here.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
            />
          </div>
          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            {message && (
              <span className={`text-sm flex items-center gap-1 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {!message.includes('Error') && <Check className="w-4 h-4" />}
                {message}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
