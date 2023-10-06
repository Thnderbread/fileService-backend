const { testusers, tempDir } = require('./setupTests');
const { sendFileToUser } = require('../controllers/fileController');
const File = require('../models/File');
const path = require('path')
const tmp = require('tmp')
const fs = require('fs')

describe('sendFileToUser', () => {
    let tempFilePath;

    beforeEach(async () => {
        tempFilePath = path.join(
            `${tempDir}`,
            `${testusers[2].files[0].fileId}.gif`
        )
        fs.writeFile(tempFilePath, 'hello!', (error, data) => {
            if (error) {
                console.error('Error while writing file:', error);
                return
            }
        })
    });

    afterEach(() => {
        tmp.setGracefulCleanup();
    });

    // Sends file to user when file id is given
    it('should send the file to the user when all parameters are given,', async () => {
        const req = {
            params: {
                fileid: testusers[2].files[0].fileId
            },
            user: testusers[2]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            download: jest.fn(),
        };

        const userFile = {
            fileUrl: `${tempFilePath}`,
            fileName: `${req.params.fileid}.gif`,
            uploader: req.user
        }


        File.findById = jest.fn().mockResolvedValue(userFile)

        await sendFileToUser(req, res);

        expect(res.download).toHaveBeenCalledWith(userFile.fileUrl, userFile.fileName);
    });

    // 
    it('should return a 409 error if the user file is not found but user id is given.', async () => {
        const req = {
            params: {
                fileid: testusers[2].files[0].fileId
            },
            user: testusers[2]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            download: jest.fn(),
        };

        const userFile = {};

        File.findById = jest.fn().mockResolvedValue(userFile);

        await sendFileToUser(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "File not found." });
    });

    // 409 error when file uploader doesn't match given user
    it('should return a 409 error if the uploader of the file does not match the given user id (req.user).', async () => {
        const req = {
            params: {
                fileid: testusers[2].files[0].fileId
            },
            user: 'invalidUserId'
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            download: jest.fn(),
        };

        const userFile = {
            fileUrl: `${tempFilePath}`,
            fileName: `${req.params.fileid}.gif`,
            uploader: testusers[2]._id
        }

        File.findById = jest.fn().mockResolvedValue(userFile);

        await sendFileToUser(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "File not found." });
    });
})