import { prisma } from '../prisma/client.js';
import { verifyToken } from '../services/token.service.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new ApiError(401, 'Authentication token is required');

  const payload = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });

  if (!user) throw new ApiError(401, 'Authenticated user no longer exists');

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) throw new ApiError(401, 'Authentication required');
  if (!roles.includes(req.user.role)) throw new ApiError(403, 'You are not allowed to perform this action');
  next();
};
