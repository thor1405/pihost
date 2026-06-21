import { useEffect } from 'react';
import { Globe, Plus, Trash2, ExternalLink, Activity } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

export default function Websites() {
  const { projects, fetchProjects, deleteProject, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      try {
        await deleteProject(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Websites</h1>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Add Domain
        </button>
      </div>

      {isLoading && projects.length === 0 ? (
        <div className="text-center text-textMuted py-12">Loading websites...</div>
      ) : projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <Globe className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hosted websites yet</h2>
          <p className="text-textMuted max-w-md mx-auto mb-6">
            Upload a static project from the Overview tab to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/10">
                  <Globe className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {project.name}
                    {project.status === 'active' && (
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    )}
                  </h3>
                  {(() => {
                    const hostname = window.location.hostname;
                    const port = window.location.port ? `:${window.location.port}` : '';
                    const url = hostname === 'localhost' || hostname === '127.0.0.1' 
                      ? `http://${project.subdomain}.localhost${port}`
                      : `http://${project.subdomain}.${hostname}.nip.io${port}`;
                    return (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm mt-1 w-fit transition-colors">
                        {project.subdomain}.pihost.app <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })()}
                  <p className="text-xs text-textMuted mt-2">
                    Last deployed: {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto border-t border-white/10 md:border-0 pt-4 md:pt-0">
                <div className="text-center hidden sm:block">
                  <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Bandwidth</p>
                  <p className="font-semibold flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-primary" />
                    {(project.bandwidthUsed || 0) > 1024 * 1024 
                      ? `${(project.bandwidthUsed / (1024 * 1024)).toFixed(2)} MB` 
                      : `${project.bandwidthUsed || 0} B`}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(project._id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors ml-auto md:ml-4"
                  title="Delete Website"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
