export const jwtConstants: { secret: string; expiresIn: string } = {
  secret: process.env.JWT_SECRET || 'dev_jwt_secret',
  expiresIn: process.env.JWT_EXPIRATION || '3600s',
};
