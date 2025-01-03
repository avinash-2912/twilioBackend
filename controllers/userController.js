const User = require('../models/User');
const { encryptData, decryptData } = require('../encryptionUtils');

exports.mapMobileNumber = async (req, res) => {
  const { uid, deviceId, mobileNumber } = req.body;

  if (!uid || !deviceId || !mobileNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const encryptedNumber = encryptData(mobileNumber);

    const existingUser = await User.findOne({ uid, deviceId });
    if (existingUser) {
      return res.status(409).json({ error: 'Record already exists' });
    }

    const user = new User({ uid, deviceId, encryptedNumber });
    await user.save();

    res.status(201).json({ message: 'Mobile number mapped successfully' });
  } catch (error) {
    console.error('Error mapping mobile number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMobileNumber = async (uid, deviceId) => {
    try {
      const user = await User.findOne({ uid, deviceId });
  
      if (!user) {
        return null;
      }
  
      return decryptData(user.encryptedNumber);
    } catch (error) {
      throw new Error("Error fetching mobile number");
    }
  };
  
