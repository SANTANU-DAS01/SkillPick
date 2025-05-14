const express = require('express');
const {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  downloadFile,
  deleteFile
} = require('../controller/fileController.js');
const { protect, authorize } = require('../middleware/auth.js');
const { upload } = require('../middleware/upload.js');

const router = express.Router();

router
  .route('/')
  .get(protect, getFiles);

router
  .route('/:id')
  .get(protect, getFile)
  .put(protect, updateFile)
  .delete(protect, deleteFile);

router.post('/upload', protect, upload.single('file'), uploadFile);

router.get('/download/:fileId', protect, downloadFile);

module.exports = router;