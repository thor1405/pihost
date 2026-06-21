import StorageFile from '../models/StorageFile.js';

export const getFiles = async (req, res) => {
  try {
    const files = await StorageFile.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // In a real S3 system, this would upload to S3 and return the URL.
    // Here we save locally in /storage/ bucket
    const url = `/storage/${req.file.filename}`;

    const newFile = await StorageFile.create({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url,
    });

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await StorageFile.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    import('fs').then(fs => {
      const path = import('path');
      path.then(p => {
        const filePath = p.join(process.cwd(), 'storage', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      })
    });

    await StorageFile.deleteOne({ _id: file._id });
    res.status(200).json({ message: 'File removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
