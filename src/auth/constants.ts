export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'CHANGE_ME_SECRET',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
};
