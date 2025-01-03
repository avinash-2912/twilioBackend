const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  deviceId: { type: String, required: true },
  encryptedNumber: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
