const fs = require('fs/promises');
const mime = require('mime-types');
const File = require('../models/File');
const User = require('../models/User');

async function saveNewFile(req, res, next) {
    const MAX_FILE_SIZE_IN_BYTES = 30 * 1024 * 1024 // 30 mb max * 1024 kbs * 1024 bytes

    // support text, images, videos, audio
    const supportedFileTypes = [
        'text/plain',
        'audio/mpeg',
        'video/mp4',
        'image/png',
        'image/jpeg',
        'image/gif'
    ]

    const file = req.body.file;

    if (!file) {
        return res.status(400).json({ error: "Missing file." })
    }

    if (file.size > MAX_FILE_SIZE_IN_BYTES) {
        // insufficient storage
        return res.status(507).json({ error: "File too large." })
    }

    try {
        // use mime to verify file instead of filename extension
        const detectedType = mime.lookup(file.name);

        // ! remove this
        console.log(detectedType);

        if (!detectedType || !supportedFileTypes.includes(detectedType)) {
            return res.sendStatus(415).json({ error: "Unsupported file type. JPEG, PNG, MP3, MP4, GIF, and TXT files are allowed." }) // unsupported media type
        }
    } catch (error) {
        // ! remove this
        console.log(error);
        return res.status(500).json({ error: "Something went wrong." })
    }

    try {
        // create new file record in MongoDB
        const newFile = await File.create({
            filename: file.name,
            file_size: file.size,
            uploader: req.user
        });

        // using the unique MongoDB id as the filename in our system
        const file_url = `../uploads/${newFile.id}`;
        await fs.writeFile(file_url, file.data);

        // Passport js gives us access to user id via deserialization
        // add the new file's id to the user's record.
        // add the url (generated via id) to the file's url field
        const user = await User.findById(req.user);
        user.files.push(newFile.id);
        newFile.file_url = file_url;

        await user.save();
        await newFile.save();

        return res.status(201).json({ message: "File saved successfully.", file_id: newFile.id });
    } catch (error) {
        // ! remove this
        console.error(error);
        return res.status(500).json({ error: "Something went wrong." })
    }
}