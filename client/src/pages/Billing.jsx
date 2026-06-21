import { useState } from 'react';
import { CreditCard, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Billing() {
  const { user, upgradePlan } = useAuthStore();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradePlan();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(false);
    }
  };
  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold">Billing & Usage</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-textMuted font-medium mb-1">Current Plan</h3>
            <div className="text-2xl font-bold flex items-baseline gap-2 capitalize">
              {user?.plan || 'Hobby'}
              {user?.plan === 'pro' && <span className="text-sm text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full ml-2">Active</span>}
            </div>
          </div>
          {user?.plan !== 'pro' ? (
            <button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="mt-6 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium w-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpgrading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upgrade to Pro'}
            </button>
          ) : (
            <button 
              disabled
              className="mt-6 bg-white/5 text-textMuted px-4 py-2 rounded-xl font-medium w-full flex items-center justify-center gap-2 opacity-70"
            >
              <Check className="w-5 h-5" />
              You are on the Pro Plan
            </button>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-textMuted font-medium mb-1">Current Balance</h3>
            <div className="text-3xl font-bold">$0.00</div>
          </div>
          <button className="mt-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium w-full flex items-center justify-center gap-2 transition-colors">
            <CreditCard className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
