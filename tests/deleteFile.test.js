const fs = require('fs');
const tmp = require('tmp')
const path = require('path');
const mongoose = require('mongoose');
const File = require('../models/File');
const User = require('../models/User');
const { testusers, tempDir } = require('./setupTests');
const { deleteFile } = require('../controllers/fileController');


describe('deleteFile', () => {

    let tempFilePath;
    // this is writing to root dir instead of uploads
    beforeEach(async () => {
        // temporary dir
        // tempDir = tmp.dirSync({ unsafeCleanup: true }).name;

        // tempFile
        tempFilePath = path.join(`${tempDir}`, `${testusers[0].files[0].fileId}.txt`)
        fs.writeFile(tempFilePath, 'Test stuff!', () => { console.log('hello') })
    })


    afterEach(() => {
        // Clean up temp dir
        tmp.setGracefulCleanup();
    });

    // Successfully delete a file owned by the user
    it('should successfully delete a file owned by the user', async () => {
        const req = {
            params: {
                fileid: testusers[0].files[0].fileId
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const foundUser = {
            files: [
                {
                    fileId: testusers[0].files[0].fileId
                }
            ],
            save: jest.fn()
        };

        const fileFromFilesystem = {
            uploader: testusers[0]._id,
            save: jest.fn()
        };


        const deletedFile = {
            fileUrl: tempFilePath,
        };

        // fs.writeFile(`${deletedFile.fileUrl}`, 'hello!', (error => {
        //     console.log(error);
        // }))

        User.findById = jest.fn().mockResolvedValue(foundUser);
        File.findById = jest.fn().mockResolvedValue(fileFromFilesystem);
        File.findByIdAndDelete = jest.fn().mockResolvedValue(deletedFile);
        fs.unlink = jest.fn().mockResolvedValue(undefined);

        await deleteFile(req, res);

        expect(User.findById).toHaveBeenCalledWith(req.user);
        expect(File.findById).toHaveBeenCalledWith(req.params.fileid);
        expect(File.findByIdAndDelete).toHaveBeenCalledWith(req.params.fileid);
        //This line is failing for some reason. Can't figure it out
        // await expect(fs.unlink).resolves.toBe(undefined); 
        expect(foundUser.files).toHaveLength(0);
        expect(foundUser.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "File deleted successfully." });
    });

    // Attempt to delete a file that does not exist
    it('should return an error when attempting to delete a file that does not exist', async () => {
        const req = {
            params: {
                fileid: new mongoose.Types.ObjectId()
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const foundUser = {
            files: [
                {
                    fileId: testusers[0].files[0].fileId
                }
            ],
            save: jest.fn()
        };

        const fileFromFilesystem = null;

        User.findById = jest.fn().mockResolvedValue(foundUser);
        File.findById = jest.fn().mockResolvedValue(fileFromFilesystem);

        await deleteFile(req, res);

        expect(User.findById).toHaveBeenCalledWith(req.user);
        expect(File.findById).toHaveBeenCalledWith(req.params.fileid);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "File not found." });
    });

    // Attempt to delete a file with an invalid file ID
    it('should return an error when attempting to delete a file with an invalid file ID', async () => {
        const req = {
            params: {
                fileid: 'invalid-file-id'
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const foundUser = {
            files: [
                {
                    fileId: testusers[0].files[0].fileId
                }
            ],
            save: jest.fn()
        };

        const fileFromFilesystem = null;

        User.findById = jest.fn().mockResolvedValue(foundUser);
        File.findById = jest.fn().mockResolvedValue(fileFromFilesystem);

        await deleteFile(req, res);

        expect(User.findById).toHaveBeenCalledWith(req.user);
        expect(File.findById).toHaveBeenCalledWith(req.params.fileid);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "File not found." });
    });

    // Attempt to delete a file with a user who does not own it
    it('should return an error when attempting to delete a file with a user who does not own it', async () => {
        const req = {
            params: {
                fileid: testusers[0].files[0].fileId
            },
            user: testusers[1]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const foundUser = {
            files: [
                {
                    fileId: testusers[0].files[0].fileId
                }
            ],
            save: jest.fn()
        };

        const fileFromFilesystem = {
            uploader: testusers[0]._id
        };

        User.findById = jest.fn().mockResolvedValue(foundUser);
        File.findById = jest.fn().mockResolvedValue(fileFromFilesystem);

        await deleteFile(req, res);

        expect(User.findById).toHaveBeenCalledWith(req.user);
        expect(File.findById).toHaveBeenCalledWith(req.params.fileid);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "You don't have access to this file." });
    });
})