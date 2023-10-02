const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    file_url: {
        type: String,
    },
    filename: {
        type: String,
        required: true,
    },
    file_size: {
        type: Number,
        required: true
    },
    file_upload_date: {
        type: Date,
        default: Date.now,
    },
    file_modified_date: {
        type: Date,
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("File", FileSchema)