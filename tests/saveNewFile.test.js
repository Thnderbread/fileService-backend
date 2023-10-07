const { testusers } = require('./setupTests');
const { saveNewFile } = require('../controllers/fileController.js');
const CustomError = require('../errors/customError');

describe('saveNewFile', () => {
    // File is defined and valid
    it('should save the file when it is defined and valid', async () => {
        const req = {
            body: {
                file: {
                    name: 'test.txt',
                    size: 1000,
                    data: 'file data'
                }
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await saveNewFile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "File saved successfully.", fileId: expect.any(String) });
    });

    // File size is within the limit
    it('should save the file when its size is within the limit', async () => {
        const req = {
            body: {
                file: {
                    name: 'test.mp3',
                    size: 1000,
                    data: 'file data'
                }
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await saveNewFile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "File saved successfully.", fileId: expect.any(String) });
    });

    // File type is supported
    it('should save the file when its type is supported', async () => {
        const req = {
            body: {
                file: {
                    name: 'test.txt',
                    size: 1000,
                    data: 'file data'
                }
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await saveNewFile(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "File saved successfully.", fileId: expect.any(String) });
    });

    // File is undefined
    it('should return a 400 error when the file is undefined', async () => {
        const req = {
            body: {},
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        try {
            await saveNewFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(400);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('Missing file.');
        }

        // expect(res.status).toHaveBeenCalledWith(400);
        // expect(res.json).toHaveBeenCalledWith({ error: "Missing file." });
    });

    // File size is too large
    it('should return a 507 error when the file size is too large', async () => {
        const req = {
            body: {
                file: {
                    name: 'test.txt',
                    size: 50000000,
                    data: 'file data'
                }
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        try {
            await saveNewFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(507);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('File too large.');
        }

        // expect(res.status).toHaveBeenCalledWith(507);
        // expect(res.json).toHaveBeenCalledWith({ error: "File too large." });
    });

    // File type is unsupported
    it('should return a 415 error when the file type is unsupported', async () => {
        const req = {
            body: {
                file: {
                    name: 'test.webp',
                    size: 1000,
                    data: 'file data'
                }
            },
            user: testusers[0]._id
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        try {
            await saveNewFile(req, res, next);
        } catch (error) {
            expect(next).toHaveBeenCalledWith(error);
            expect(error).toBeInstanceOf(CustomError);

            expect(error.statusCode).toBe(415);
            expect(error.name).toBe('FileError');
            expect(error.message).toBe('Unsupported file type. JPEG, PNG, MP3, MP4, GIF, and TXT files are allowed.');
        }

        // expect(res.status).toHaveBeenCalledWith(415);
        // expect(res.json).toHaveBeenCalledWith({ error: "Unsupported file type. JPEG, PNG, MP3, MP4, GIF, and TXT files are allowed." });
    });
});