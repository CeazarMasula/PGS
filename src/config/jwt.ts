const SERVER_TOKEN_EXPIRE_TIME = process.env.SERVER_TOKEN_EXPIRE_TIME || 3_600;
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'isUser';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'superpassword';

const token = {
    expireTime: SERVER_TOKEN_EXPIRE_TIME,
    issUser: SERVER_TOKEN_ISSUER,
    secret: SERVER_TOKEN_SECRET
};
export default token;
