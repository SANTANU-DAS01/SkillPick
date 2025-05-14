
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const File = require('../models/File');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (!fs.existsSync('uploads/')) {
      fs.mkdirSync('uploads/');
    }
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

// Set up Google Drive with Service Account
let drive;

try {
  let auth;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
  } else if (fs.existsSync('./service-account-key.json')) {
    const serviceAccount = require('../service-account-key.json');
    auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
  } else {
    console.error('No service account credentials found. Please provide them either as a file named "service-account-key.json" or as an environment variable GOOGLE_SERVICE_ACCOUNT_JSON');
  }
  drive = google.drive({ version: 'v3', auth });
  console.log('Google Drive API initialized');
} catch (error) {
  console.error('Error initializing Google Drive API:', error);
}

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }
    const { relatedModel, relatedId, type } = req.body;
    if (!relatedModel || !relatedId || !type) {
      return res.status(400).json({ success: false, error: 'Please provide related model, ID, and type' });
    }

    const filePath = req.file.path;

    if (type === 'cover_image') {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'cover_images'
      });

      const file = await File.create({
        name: req.file.originalname,
        fileUrl: result.secure_url,
        fileId: result.public_id,
        format: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        relatedTo: { model: relatedModel, id: relatedId }
      });

      fs.unlinkSync(filePath);

      res.status(201).json({ success: true, data: file, cloudinaryResult: result });

    } else if (type === 'book') {
      // Upload to Google Drive
      const fileMetadata = { name: req.file.originalname };
      const media = { mimeType: req.file.mimetype, body: fs.createReadStream(filePath) };
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id,name,mimeType,webViewLink'
      });
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });

      const file = await File.create({
        name: req.file.originalname,
        fileUrl: response.data.webViewLink,
        fileId: response.data.id,
        format: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        relatedTo: { model: relatedModel, id: relatedId }
      });

      fs.unlinkSync(filePath);

      res.status(201).json({ success: true, data: file, webViewLink: response.data.webViewLink });

    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: 'Invalid type. Must be "cover_image" or "book"' });
    }
  } catch (error) {
    next(error);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const fileInfo = await File.findOne({ fileId });
    if (!fileInfo) {
      return res.status(404).json({ success: false, error: 'File not found in database' });
    }
    const fileMetadata = await drive.files.get({ fileId: fileId, fields: 'name,mimeType' });
    res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.data.name}"`);
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
    const response = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    await drive.files.delete({ fileId: fileId });
    await File.findOneAndDelete({ fileId: fileId });
    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getFiles = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.uploadedBy = req.user.id;
    }
    const files = await File.find(query).populate('uploadedBy', 'name email').sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, count: files.length, data: files });
  } catch (error) {
    next(error);
  }
};

exports.getFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    if (file.uploadedBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to access this file' });
    }
    res.status(200).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

exports.updateFile = async (req, res, next) => {
  try {
    const file = await File.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    res.status(200).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

exports.upload = upload;
