export const generateCustomId = (
  prefix: string = '',
  maxLength: number = 10,
): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';

  for (let i = 0; i < maxLength; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix ? `${prefix}-${id}` : id;
};
