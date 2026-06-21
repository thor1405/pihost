import { useEffect, useState, useRef } from 'react';
import { Database, Plus, Upload, Trash2, File as FileIcon, Loader2, Download } from 'lucide-react';
import { useStorageStore } from '../store/storageStore';

export default function Storage() {
  const { files, fetchFiles, uploadFile, deleteFile, isLoading } = useStorageStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadFile(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const serverUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:5000';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Storage</h1>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            Upload File
          </button>
        </div>
      </div>

      {isLoading && files.length === 0 ? (
        <div className="text-center text-textMuted py-12">Loading storage...</div>
      ) : files.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
          <Database className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Storage Bucket is empty</h2>
          <p className="text-textMuted max-w-md mx-auto mb-6">
            Upload images, documents, or backups to be hosted on your edge node.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            Upload your first file
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm text-textMuted">
                <th className="font-medium p-4 pl-6">Filename</th>
                <th className="font-medium p-4">Size</th>
                <th className="font-medium p-4">Uploaded</th>
                <th className="font-medium p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-textMuted" />
                      </div>
                      <div>
                        <p className="font-medium">{file.originalName}</p>
                        <p className="text-xs text-textMuted">{file.mimetype}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-textMuted text-sm">{formatBytes(file.size)}</td>
                  <td className="p-4 text-textMuted text-sm">{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 pr-6">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={`${serverUrl}${file.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(file._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
