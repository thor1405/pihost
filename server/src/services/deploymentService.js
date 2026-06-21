import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import Docker from 'dockerode';
import tar from 'tar-fs';
import Deployment from '../models/Deployment.js';
import Project from '../models/Project.js';

const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

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

    // Phase 6: PaaS Backend Engine Check
    const hasPackageJson = fs.existsSync(path.join(publicDir, 'package.json'));
    
    if (hasPackageJson) {
      deployment.buildLogs.push('Detected package.json. Building Node.js PaaS container...');
      await deployment.save();

      // 1. Write Dockerfile
      fs.writeFileSync(path.join(publicDir, 'Dockerfile'), `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
      `);

      // 2. Build Docker Image
      const pack = tar.pack(publicDir);
      const imageName = `pihost-app-${project.subdomain}`;
      
      const buildStream = await docker.buildImage(pack, { t: imageName });
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(buildStream, (err, res) => err ? reject(err) : resolve(res),
          (event) => {
            if (event.stream) deployment.buildLogs.push(event.stream.trim());
          }
        );
      });

      deployment.buildLogs.push('Image built. Starting container...');
      await deployment.save();
      
      // 3. Stop and Remove old container if exists
      const containerName = `pihost-app-${project.subdomain}`;
      try {
        const oldContainer = docker.getContainer(containerName);
        await oldContainer.stop();
        await oldContainer.remove();
      } catch (e) {} // Ignore if it doesn't exist

      // 4. Start New Container
      const container = await docker.createContainer({
        Image: imageName,
        name: containerName,
        HostConfig: {
          NetworkMode: 'pihost_pihost-net', // Must match docker-compose network name
          RestartPolicy: { Name: 'unless-stopped' }
        }
      });
      await container.start();
      
      // 5. Write Nginx Config
      const nginxConfPath = path.join(process.cwd(), 'nginx_conf', `${project.subdomain}.conf`);
      const nginxConfig = `
server {
    listen 80;
    server_name ~^${project.subdomain}\\.(pihost\\.app|localhost|\\d+\\.\\d+\\.\\d+\\.\\d+\\.nip\\.io)$;

    location / {
        proxy_pass http://${containerName}:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
      `;
      
      const nginxConfDir = path.join(process.cwd(), 'nginx_conf');
      if (!fs.existsSync(nginxConfDir)) {
        fs.mkdirSync(nginxConfDir, { recursive: true });
      }
      fs.writeFileSync(nginxConfPath, nginxConfig);
      
      deployment.buildLogs.push('Routing applied. Reloading Nginx...');
      await deployment.save();
      
      // 6. Reload Nginx
      try {
        const nginxContainer = docker.getContainer('pihost-nginx');
        const exec = await nginxContainer.exec({ Cmd: ['nginx', '-s', 'reload'], AttachStdout: true, AttachStderr: true });
        await exec.start({});
      } catch (err) {
        console.error('Failed to reload nginx', err);
        deployment.buildLogs.push('Warning: Failed to reload Nginx automatically.');
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
