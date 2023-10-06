const { testusers, testFiles } = require('./setupTests');
const CustomError = require('../errors/customError');
const { retrieveUserFiles } = require('../controllers/fileController');
const File = require('../models/File');

describe('retrieveUserFiles', () => {
    // Retrieves all of the user's files.
    it('should retrieve all files a user has when the user id is given', async () => {
        const req = {
            user: testusers[1]._id
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        userFiles = testFiles
            .filter(file => file.uploader.equals(req.user))
            .map((file) => {
                file.fileUploadDate = null;
                file.fileModifiedDate = null;
                delete file.uploader;
                return file
            })


        File.find = jest.fn().mockResolvedValue(userFiles)

        await retrieveUserFiles(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            userFiles: expect.arrayContaining([
                expect.objectContaining({

                    fileName: 'test.mp3',
                    fileSize: 3000,
                    fileUploadDate: null,
                    fileModifiedDate: null
                }),
                expect.objectContaining({
                    fileName: 'another1.gif',
                    fileSize: 10000,
                    fileUploadDate: null,
                    fileModifiedDate: null,
                })
            ])
        })

    });

    // No uploads
    it('should return a 200 status with an empty array when the user has no files', async () => {
        const req = {
            user: testusers[2]._id
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const userFiles = []

        File.find = jest.fn().mockReturnValue(userFiles);

        await retrieveUserFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ userFiles: [] })
    });

    // No user id
    it('should throw a CustomError when there is no user id given', async () => {
        const req = {
            user: null
        };

        File.find = jest.fn().mockRejectedValue(new Error('Some Error'))

        try {
            await retrieveUserFiles(req)
        } catch (error) {
            expect(error).toBeInstanceOf(CustomError)
            expect(error.statusCode).toBe(500)
        }
    })
})