const generateQRUrl = (qrId: string): string => {
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  return `${baseUrl}?size=200x200&data=${encodeURIComponent(qrId)}`;
};

export default generateQRUrl;