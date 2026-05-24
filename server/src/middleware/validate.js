import { ApiError } from '../utils/apiError.js';

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    throw new ApiError(422, 'Validation failed', parsed.error.flatten());
  }

  req.validated = parsed.data;
  next();
};
