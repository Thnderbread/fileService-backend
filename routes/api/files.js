const router = require('express').Router();
const fileController = require('../../controllers/fileController');

router
    .get('/files', fileController.retrieveUserFiles)
    .get('/download/:fileid', fileController.sendFileToUser)
    .post('/upload', fileController.saveNewFile)
    .put('/rename/:fileid/:filename', fileController.renameFile)
    .delete('/delete/:fileid', fileController.deleteFile);

module.exports = router;