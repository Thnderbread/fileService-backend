const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true
    },
    fileUploadDate: {
        type: Date,
        default: Date.now,
    },
    fileModifiedDate: {
        type: Date,
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("File", FileSchema)