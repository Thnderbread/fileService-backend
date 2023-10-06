const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const File = require('../models/File');
const tmp = require('tmp')

let tempDir = tmp.dirSync({ unsafeCleanup: true }).name;

const testusers = [
    {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser1',
        email: 'testemail@example.com',
        password: 'testpass123',
        files: [
            { fileId: new mongoose.Types.ObjectId(), fileName: 'test.txt' },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser2',
        email: 'testemail2@example.com',
        password: 'testpass123',
        files: [
            { fileId: new mongoose.Types.ObjectId(), fileName: 'test.mp3' },
        ]
    },
    {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser3',
        email: 'testemai3l@example.com',
        password: 'testpass123',
        files: [
            { fileId: new mongoose.Types.ObjectId(), fileName: 'test.gif' },
        ]
    }
]

const testFiles = [
    {
        fileName: 'test.txt',
        fileSize: 1000,
        uploader: testusers[0]._id
    },
    {
        fileName: 'test.mp3',
        fileSize: 3000,
        uploader: testusers[1]._id
    },
    {
        fileName: 'test.gif',
        fileSize: 10000,
        uploader: testusers[2]._id
    }
]

beforeAll(async () => {
    console.log('Before all function called');
    mongoServer = await MongoMemoryServer.create();
    const testUri = await mongoServer.getUri();
    await mongoose.connect(testUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await File.insertMany(testFiles);
    await User.insertMany(testusers);

    console.log('Server created');
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

module.exports = { testusers, tempDir };