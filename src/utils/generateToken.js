import jwt from 'jsonwebtoken'
import config from 'config'

const generateAccessToken = (userObj) => {
    return jwt.sign(userObj, config.get("access_token.secret"), { expiresIn: config.get("access_token.exp") });
}

const generateRefreshToken = (userObj) => {
    return jwt.sign(userObj, config.get("refresh_token.secret"), { expiresIn: config.get("refresh_token.exp") });
}


export { generateAccessToken, generateRefreshToken }