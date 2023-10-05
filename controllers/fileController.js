const path = require('path');
const fs = require('fs/promises');
const mime = require('mime-types');
const File = require('../models/File');
const User = require('../models/User');

const mongoose = require('mongoose');

const __uploaddir = path.join(__dirname, '..');

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

    if (file === undefined) {
        return res.status(400).json({ error: "Missing file." })
    }

    if (file.size > MAX_FILE_SIZE_IN_BYTES) {
        // insufficient storage
        return res.status(507).json({ error: "File too large." })
    }

    // creating a filetype variable here to make sure it's valid.
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
                : mime.lookup(file.name).split('/').pop();

        // ! remove this - add next function for middleware
        if (!mimeType || !supportedMimeTypes.includes(mimeType)) {
            return res.status(415).json({ error: "Unsupported file type. JPEG, PNG, MP3, MP4, GIF, and TXT files are allowed." }) // unsupported media type
        }
    } catch (error) {
        // ! remove this - add next function for middleware
        return res.status(500).json({ error: "Something went wrong." })
    }

    try {
        // create new file record in MongoDB
        const newFile = await File.create({
            fileName: file.name,
            fileSize: file.size,
            uploader: req.user
        });

        // using the unique MongoDB id as the filename in our system.
        // use the file type detected by mime module as the file extension to enforce predictable naming

        const fileUrl = path.join(__uploaddir, 'uploads', `${newFile.id}.${fileType.split('/').pop()}`)
        // __uploaddir + `/uploads/${newFile.id}.${fileType.split('/').pop()}`;
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
        // ! remove this - add next function for middleware
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." })
    }
}

async function renameFile(req, res, next) {
    const fileId = req.params.fileid;
    const newFilename = req.params.filename;

    // Make sure new name was supplied
    if (!newFilename || !fileId) {
        return res.status(400).json({ error: "Missing filename or file id." })
    }

    // Find user and grab their file
    let foundUser;

    try {
        foundUser = await User.findById(req.user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." })
    }

    const userFile = foundUser?.files.find(file => file.fileId.equals(fileId));

    // Check that file is found. Check old filename vs new filename.
    if (!userFile) {
        return res.status(409).json({ error: "Could not find specified file." })
    } else if (userFile.fileName === newFilename.toLowerCase()) {
        return res.status(400).json({ error: "New filename cannot be same as old filename." });
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
        console.error(error);
        res.status(500).json({ error: "Something went wrong." })
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
        // ! remove this - add next function for middleware
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." })
    }

    // find the file in the user's User record
    // using fileIndex here to easily remove file from 
    // user's record later
    const fileIndex = foundUser.files.findIndex(file => file.fileId.equals(fileId));

    // ensure the file actually exists
    if (fileIndex === -1 || !fileFromFilesystem) {
        // ! remove this - add next function for middleware
        return res.status(409).json({ error: "File not found." })
    } else if (fileFromFilesystem.uploader !== req.user) {
        return res.status(403).json({ error: "You don't have access to this file." });
    }

    try {
        // remove file from user's User record using index
        // use the index here to easily remove the file from the user's
        // file array
        foundUser?.files.splice(fileIndex);

        // delete file from File collection
        const deletedFile = await File.findByIdAndDelete(fileId);
        console.log('Deleted the file!');
        const fileUrl = deletedFile.fileUrl;
        console.log('Got the file url!');

        // remove file from filesystem
        console.log('Deleting the file!');
        await fs.unlink(fileUrl);
        console.log('Deleted the file!');


        await foundUser.save();
        await fileFromFilesystem.save();
    } catch (error) {
        // ! remove this - add next function for middleware
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." });
    }
    return res.status(200).json({ message: "File deleted successfully." });
}

async function sendFileToUser(req, res, next) {
    const fileId = req.params.fileid;

    try {
        userFile = await File.findById(fileId);
        if (!userFile || userFile.uploader !== req.user) {
            return res.status(409).json({ error: "File not found." })
        }

        // using the name from the database to retrieve file extension.
        return res.download(userFile.fileUrl, userFile.fileName)

    } catch (error) {
        // ! remove this - add next function for middleware
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." })
    }
}

module.exports = {
    deleteFile,
    renameFile,
    saveNewFile,
    sendFileToUser,
}