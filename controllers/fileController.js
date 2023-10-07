require('dotenv').config();
const path = require('path');
const fs = require('fs/promises');
const mime = require('mime-types');
const mongoose = require('mongoose');
const File = require('../models/File');
const User = require('../models/User');
const CustomError = require('../errors/customError')

let __uploaddir;

if (process.env.ENVIRONMENT == 'DEV') {
    let { tempDir } = require('../tests/setupTests');
    __uploaddir = tempDir
} else {
    __uploaddir = path.join(__dirname, '..', 'uploads')
}

async function saveNewFile(req, res, next) {
    const MAX_FILE_SIZE_IN_BYTES = 30 * 1024 * 1024 // 30 mb max * 1024 kbs * 1024 bytes

    // support text, images, videos, audio
    const supportedMimeTypes = [
        'text/plain',
        'audio/mpeg',
        'video/mp4',
        'image/png',
        'image/jpeg',
        'image/gif'
    ]

    const file = req.body.file;

    try {
        if (file === undefined) {
            throw new CustomError('FileError', 400, 'Missing file.');
        }

        if (file.size > MAX_FILE_SIZE_IN_BYTES) {
            // insufficient storage
            throw new CustomError('FileError', 507, 'File too large.');
        }
    } catch (error) {
        next(error);
    }

    // creating a fileType variable here to capture the extension.
    // will use this later as the file extension when saving.
    let fileType;
    try {
        // use mime to verify file instead of filename extension. Extract file extension from mimeType.
        mimeType = mime.lookup(file.name);

        // return txt extension for plaintext result, mp3 extension for mpeg extension.
        fileType = mimeType === 'text/plain'
            ? 'txt'
            : mimeType === 'audio/mpeg'
                ? 'mp3'
                : mimeType.split('/').pop();

        if (!mimeType || !supportedMimeTypes.includes(mimeType)) {
            throw new CustomError(
                'FileError',
                415,
                "Unsupported file type. JPEG, PNG, MP3, MP4, GIF, and TXT files are allowed."
            )
        }
    } catch (error) {
        next(error)
    }

    try {
        // create new file record in MongoDB
        const newFile = await File.create({
            fileName: file.name,
            fileSize: file.size,
            uploader: req.user
        });

        // using the unique MongoDB id as the filename in our system.
        // use the file type detected by mime module as the file extension to enforce predictable naming.
        const fileUrl = path.join(__uploaddir, `${newFile.id}.${fileType}`)
        await fs.writeFile(fileUrl, file.data);

        // Passport js gives us access to user id via deserialization
        // add the new file's id to the user's record.
        // add the url (generated via id) to the file's url field
        const foundUser = await User.findById(req.user);
        foundUser?.files.push({ fileId: newFile.id, fileName: file.name.toLowerCase() });
        newFile.fileUrl = fileUrl;

        await foundUser.save();
        await newFile.save();

        return res.status(201).json({ message: "File saved successfully.", fileId: newFile.id });
    } catch (error) {
        next(error)
    }
}

async function renameFile(req, res, next) {
    const fileId = req.params.fileid;
    const newFilename = req.params.filename;

    // Find user and grab their file
    let foundUser;

    try {
        // Make sure new name was supplied
        if (!newFilename || !fileId) {
            throw new CustomError('FileError', 400, 'Missing filename or file id.');
        }

        foundUser = await User.findById(req.user);
    } catch (error) {
        next(error)
    }

    // Look for file. Check old filename vs new filename.
    try {
        const userFile = foundUser?.files.find(file => file.fileId.equals(fileId));

        if (userFile === undefined) {
            throw new CustomError('FileError', 409, 'File not found.');

        } else if (userFile.fileName === newFilename.toLowerCase()) {
            throw new CustomError('FileError', 400, 'New filename cannot be the same as old filename.');

        }
    } catch (error) {
        next(error)
    }

    try {
        // update file's modification date
        const fileFromFilesystem = await File.findById(fileId);
        fileFromFilesystem.fileModifiedDate = Date.now();

        // rename file in files and user's records
        userFile.fileName = newFilename;
        fileFromFilesystem.fileName = newFilename;

        await foundUser.save();
        await fileFromFilesystem.save();
    } catch (error) {
        next(error);
    }

    return res.status(201).json({ message: "File renamed successfully." })
}

async function deleteFile(req, res, next) {
    const fileId = req.params.fileid;

    let foundUser;
    let fileFromFilesystem;

    try {
        // get user and file from respective collections
        foundUser = await User.findById(req.user);
        // in this context, this is using to represent the file on the filesystem.
        fileFromFilesystem = await File.findById(fileId);
    } catch (error) {
        next(error)
    }

    // find the file in the user's User record
    // using fileIndex here to easily remove file from 
    // user's record later
    const fileIndex = foundUser.files.findIndex(file => file.fileId.equals(fileId));

    // ensure the file actually exists, and requester is the same as uploader.
    try {
        if (fileIndex === -1 || fileFromFilesystem === undefined) {
            throw new CustomError('FileError', 409, 'File not found.');

        } else if (!fileFromFilesystem?.uploader.equals(req.user)) {
            // using 409 error for obscurity...may decide to revert to 403
            throw new CustomError('FileError', 409, 'File not found.');

        }
    } catch (error) {
        next(error)
    }

    try {
        // remove file from user's User record using index
        // use the index here to easily remove the file from the user's
        // file array
        foundUser?.files.splice(fileIndex);

        // delete file from File collection
        const deletedFile = await File.findByIdAndDelete(fileId);
        const fileUrl = deletedFile.fileUrl;

        // remove file from filesystem
        await fs.unlink(fileUrl);

        await foundUser.save();
        await fileFromFilesystem.save();
    } catch (error) {
        next(error)
    }
    return res.status(200).json({ message: "File deleted successfully." });
}

async function sendFileToUser(req, res, next) {
    const fileId = req.params.fileid;

    let userFile;
    // Check for file. Ensure requester is the same as uploader. 
    try {
        userFile = await File.findById(fileId);

        if (userFile === undefined || !userFile.uploader?.equals(req.user)) {
            throw new CustomError('FileError', 409, "File not found.");
        }
    } catch (error) {
        next(error)
    }

    // using the fileName from the database to retrieve file extension.
    return res.download(userFile.fileUrl, userFile.fileName);
}

async function retrieveUserFiles(req, res, next) {
    try {
        const userFiles = await File.find(
            { uploader: req.user },
            'fileName fileSize fileUploadDate fileModifiedDate'
        );
        return res.status(200).json({ userFiles: userFiles });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    deleteFile,
    renameFile,
    saveNewFile,
    sendFileToUser,
    retrieveUserFiles
}