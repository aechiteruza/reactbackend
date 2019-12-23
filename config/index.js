const config = {}

config.JWT_KEY = 'aechiteru_jwt_secret_key';
config.MONGO_URL = 'mongodb://localhost:27017/cloudmqtttest';
config.SALT_ROUNDS = 13;

module.exports = config;