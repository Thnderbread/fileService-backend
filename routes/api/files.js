const router = require('express').Router();
const fileController = require('../../controllers/fileController');

router
    .get('/files', fileController.retrieveUserFiles)
    .post('/upload', fileController.saveNewFile)
    .put('/rename', fileController.renameFile)
    .delete('/delete', fileController.deleteFile);

module.exports = router;