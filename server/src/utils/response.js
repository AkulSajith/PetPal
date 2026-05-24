export function toPublicUser(user) {
  if (!user) return user;
  const { password, ...publicUser } = user;
  return publicUser;
}

export function sendCreated(res, data) {
  return res.status(201).json({ data });
}
