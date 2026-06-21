import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import Deployment from '../models/Deployment.js';
import Project from '../models/Project.js';

export const deployStaticSite = async (zipFilePath, project, deploymentId) => {
  const deployment = await Deployment.findById(deploymentId);
  const startTime = Date.now();

  try {
    deployment.buildLogs.push('Starting deployment process...');
    await deployment.save();

    // Define where to extract
    const publicDir = path.join(process.cwd(), 'public_sites', project.subdomain);
    
    // Clean up existing directory if any
    if (fs.existsSync(publicDir)) {
      deployment.buildLogs.push('Cleaning up previous deployment...');
      fs.rmSync(publicDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(publicDir, { recursive: true });

    // Extract zip
    deployment.buildLogs.push(`Extracting ${path.basename(zipFilePath)}...`);
    await deployment.save();

    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(publicDir, true);

    deployment.buildLogs.push('Files extracted successfully.');

    // Fix GitHub nested folder issue (if zip contains a single root folder)
    const items = fs.readdirSync(publicDir);
    if (items.length === 1) {
      const singleItemPath = path.join(publicDir, items[0]);
      if (fs.statSync(singleItemPath).isDirectory()) {
        deployment.buildLogs.push('Detected nested root folder. Rearranging files...');
        const nestedItems = fs.readdirSync(singleItemPath);
        for (const item of nestedItems) {
          fs.renameSync(path.join(singleItemPath, item), path.join(publicDir, item));
        }
        fs.rmdirSync(singleItemPath);
      }
    }
    
    deployment.status = 'success';
    deployment.duration = (Date.now() - startTime) / 1000;
    deployment.buildLogs.push('Deployment completed successfully. Your site is live!');
    await deployment.save();

    // Update project storage and deployments history
    const zipSize = fs.existsSync(zipFilePath) ? fs.statSync(zipFilePath).size : 0;
    await Project.findByIdAndUpdate(project._id, {
      status: 'active',
      storageUsed: zipSize,
      $push: { 
        deployments: { 
          status: 'success', 
          size: zipSize 
        } 
      }
    });

    // Clean up uploaded zip
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }

  } catch (error) {
    console.error('Deployment failed:', error);
    deployment.status = 'failed';
    deployment.buildLogs.push(`Error: ${error.message}`);
    deployment.duration = (Date.now() - startTime) / 1000;
    await deployment.save();

    await Project.findByIdAndUpdate(project._id, {
      status: 'error',
      $push: { deployments: { status: 'failed' } }
    });
    
    // Clean up zip on error
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
  }
};
