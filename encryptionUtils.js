const Cryptr = require('cryptr');
const cryptr = new Cryptr('tsstingjhjhjhcoede', {
  saltLength: 20,
});

exports.encryptData = (rawData) => {
  return cryptr.encrypt(rawData);
};

exports.decryptData = (encryptedData) => {
  return cryptr.decrypt(encryptedData);
};
