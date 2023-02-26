const generateClientId = (prefix: string): string => {
  const randomId = Math.random().toString(16).slice(2);
  return `${prefix}-${randomId}`;
};

export default generateClientId;
