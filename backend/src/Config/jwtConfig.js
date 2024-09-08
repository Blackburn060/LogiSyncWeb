module.exports = {
    jwtSecret: process.env.SECRET_KEY,
    jwtExpiration: '1h',
    refreshSecret: process.env.REFRESH_SECRET_KEY,
    refreshExpiration: '7d',
};