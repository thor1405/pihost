import { useEffect, useState, useRef } from 'react';
import { Plus, GitBranch, Globe, MoreVertical, Activity, HardDrive, Upload, ExternalLink } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

export default function Dashboard() {
  const { projects, isLoading, fetchProjects, createProject, deployProject, error } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [localError, setLocalError] = useState('');

  const totalStorage = projects.reduce((acc, project) => acc + (project.storageUsed || 0), 0);
  const totalBandwidth = projects.reduce((acc, project) => acc + (project.bandwidthUsed || 0), 0);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await createProject(newProjectName, 'static');
      setNewProjectName('');
      setIsModalOpen(false);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Failed to create project');
      console.error(err);
    }
  };

  const handleDeployClick = (projectId) => {
    setSelectedProjectId(projectId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setIsDeploying(true);
    try {
      await deployProject(selectedProjectId, file);
      // Wait a moment and fetch projects to show updated status
      setTimeout(() => fetchProjects(), 2000);
    } catch (err) {
      console.error('Deploy failed', err);
      alert('Deployment failed. Ensure it is a valid .zip file and < 50MB.');
    } finally {
      setIsDeploying(false);
      setSelectedProjectId(null);
      e.target.value = ''; // reset input
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'building': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Hidden File Input for Deployment */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".zip" 
        className="hidden" 
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Overview</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-sm font-medium">Total Projects</span>
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{projects.length}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-sm font-medium">Bandwidth (30d)</span>
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{formatBytes(totalBandwidth)}</div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-textMuted">
            <span className="text-sm font-medium">Storage Used</span>
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{formatBytes(totalStorage)}</div>
        </div>
      </div>

      {/* Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="text-center py-12 text-textMuted">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-card/20">
            <p className="text-textMuted mb-4">You haven't created any projects yet.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="glass-card rounded-2xl overflow-hidden hover:border-white/20 transition-colors group">
                <div className="h-24 bg-gradient-to-br from-card to-background p-4 flex items-start justify-between relative border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-textMuted" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeployClick(project._id)}
                      title="Upload ZIP & Deploy"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button className="text-textMuted hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{project.name}</h3>
                  {(() => {
                    const hostname = window.location.hostname;
                    const port = window.location.port ? `:${window.location.port}` : '';
                    const url = hostname === 'localhost' || hostname === '127.0.0.1' 
                      ? `http://${project.subdomain}.localhost${port}`
                      : `http://${project.subdomain}.${hostname}.nip.io${port}`;
                    return (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm mt-1 transition-colors">
                        {project.subdomain}.pihost.app <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })()}
                  <div className="flex items-center justify-between text-xs mt-4">
                    <span className={`px-2 py-1 rounded-md border capitalize ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-textMuted text-xs uppercase">{project.framework}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full px-4 py-2 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                  placeholder="e.g. my-awesome-site"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              {localError && <p className="text-red-400 text-sm mb-4">{localError}</p>}
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-textMuted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || !newProjectName}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deploying Overlay */}
      {isDeploying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Deploying your site...</h2>
          <p className="text-textMuted">Uploading zip, extracting, and configuring Nginx simulation.</p>
        </div>
      )}
    </div>
  );
}
