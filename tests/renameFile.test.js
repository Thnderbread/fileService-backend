const mongoose = require('mongoose');
const { testusers } = require('./setupTests');
const { renameFile } = require('../controllers/fileController');

describe('renameFile', () => {
    // Filename and id are given
    it('should rename the given file when all parameters are given correctly', async () => {
        const req = {
            params: {
                fileid: testusers[0].files[0].fileId,
                filename: 'newFile.txt'
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await renameFile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "File renamed successfully." })
    });

    // Missing filename
    it('should return a 400 when the filename is not given', async () => {
        const req = {
            params: {
                fileid: testusers[1].files[0].fileId,
            },
            user: testusers[1]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await renameFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing filename or file id." });
    });

    // Missing file id
    it('should return a 400 error when the file id is not given', async () => {
        const req = {
            params: {
                filename: 'newFile.txt',
            },
            user: testusers[1]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await renameFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing filename or file id." });
    });

    // User does not have requested file
    it('should return a 409 error when the requested file is not found', async () => {
        const req = {
            params: {
                fileid: new mongoose.Types.ObjectId(),
                filename: 'newFile.txt',
            },
            user: testusers[1]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await renameFile(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "Could not find specified file." })
    });

    // New filename is the same as old filename with different case
    it('should return a 400 error when the new filename is the same as the old one', async () => {
        const req = {
            params: {
                fileid: testusers[1].files[0].fileId,
                filename: testusers[1].files[0].fileName
            },
            user: testusers[1]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await renameFile(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "New filename cannot be same as old filename." });
    });
})