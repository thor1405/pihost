import fs from 'fs';
import path from 'path';
import Project from '../models/Project.js';
import Deployment from '../models/Deployment.js';
import { deployStaticSite } from '../services/deploymentService.js';

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { name, framework } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Simple subdomain generation based on name and random string
    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    const project = await Project.create({
      userId: req.user._id,
      name,
      subdomain,
      framework: framework || 'static',
      status: 'active'
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload static files (zip) and deploy
// @route   POST /api/projects/:id/deploy
// @access  Private
export const deployProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a zip file containing your site' });
    }

    // Create a deployment record
    const deployment = await Deployment.create({
      projectId: project._id,
      status: 'building',
      deployedUrl: `${project.subdomain}.pihost.app`, // Concept URL
    });

    // Start background deployment process
    // In a real app, you would use a queue like BullMQ or RabbitMQ
    deployStaticSite(req.file.path, project, deployment._id).catch(console.error);

    res.status(202).json({
      message: 'Deployment started',
      deploymentId: deployment._id,
      project
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Attempt to delete physical files
    const publicDir = path.join(process.cwd(), 'public_sites', project.subdomain);
    if (fs.existsSync(publicDir)) {
      fs.rmSync(publicDir, { recursive: true, force: true });
    }

    await Project.deleteOne({ _id: project._id });
    res.status(200).json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
