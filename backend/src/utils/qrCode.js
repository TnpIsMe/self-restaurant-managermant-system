import QRCode from 'qrcode'

/**
 * Tạo VietQR data URL
 * Chuẩn VietQR: https://vietqr.io/danh-sach-api/generate-qr/
 */
export async function generateVietQR({ amount, invoiceCode }) {
  const bankCode    = process.env.BANK_CODE        || 'VCB'
  const accountNo   = process.env.BANK_ACCOUNT_NO  || '1234567890'
  const accountName = encodeURIComponent(process.env.BANK_ACCOUNT_NAME || 'Self Restaurant')
  const description = encodeURIComponent(`Thanh toan ${invoiceCode}`)

  // VietQR compact image URL (dùng được offline bằng cách embed base64)
  const vietQrUrl =
    `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png` +
    `?amount=${amount}&addInfo=${description}&accountName=${accountName}`

  // Wrap URL vào QR code ảnh base64 để nhúng vào response
  const dataUrl = await QRCode.toDataURL(vietQrUrl, { errorCorrectionLevel: 'M', width: 300 })
  return dataUrl
}
