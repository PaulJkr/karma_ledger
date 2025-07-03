export const handleError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
