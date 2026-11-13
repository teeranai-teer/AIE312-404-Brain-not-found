// code: 'errNetwork' | 'errTimeout' | 'errServer' (ใช้เป็น key คำแปล)
// serverMessage: ข้อความไทยจาก BE ตามสัญญา { "error": "..." } ถ้ามี
export class ApiError extends Error {
  constructor(code, serverMessage = '') {
    super(serverMessage || code);
    this.code = code;
    this.serverMessage = serverMessage;
  }
}

// แปลง error เป็นข้อความที่แสดงให้ผู้ใช้เห็น
export function errorText(err, t) {
  if (err instanceof ApiError) return err.serverMessage || t(err.code);
  return t('errNetwork');
}
