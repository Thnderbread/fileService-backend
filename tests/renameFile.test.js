const mongoose = require('mongoose');
const { testusers } = require('./setupTests');
const { renameFile } = require('../controllers/fileController');
const CustomError = require('../errors/customError');
const File = require('../models/File');

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
        }

        const fileFromFilesystem = {
            fileModifiedDate: Date.now(),
            save: jest.fn()
        };

        const next = jest.fn();
        File.findById = jest.fn().mockResolvedValue(fileFromFilesystem);

        await renameFile(req, res, next);

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
        }

        const next = jest.fn()

        try {
            await renameFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('Missing filename or file id.');
        }

        // expect(res.status).toHaveBeenCalledWith(400);
        // expect(res.json).toHaveBeenCalledWith({ error: "Missing filename or file id." });
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
        }

        const next = jest.fn()

        try {
            await renameFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('Missing filename or file id.');
        }

        // expect(res.status).toHaveBeenCalledWith(400);
        // expect(res.json).toHaveBeenCalledWith({ error: "Missing filename or file id." });
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
        }

        const next = jest.fn();

        try {
            await renameFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(409);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('File not found.');
        }

        // expect(res.status).toHaveBeenCalledWith(409);
        // expect(res.json).toHaveBeenCalledWith({ error: "File not found." })
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
        }

        const next = jest.fn();

        try {
            await renameFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('New filename cannot be the same as old filename.');
        }

        // expect(res.status).toHaveBeenCalledWith(400);
        // expect(res.json).toHaveBeenCalledWith({ error: "New filename cannot be the same as old filename." });
    });
})