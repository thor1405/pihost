import { Database, Plus } from 'lucide-react';

export default function Databases() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Databases</h1>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          New Database
        </button>
      </div>
      
      <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
        <Database className="w-12 h-12 text-textMuted mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Managed Databases</h2>
        <p className="text-textMuted max-w-md mx-auto mb-6">
          Provision highly available MongoDB, PostgreSQL, or Redis clusters directly on your edge nodes.
        </p>
      </div>
    </div>
  );
}
