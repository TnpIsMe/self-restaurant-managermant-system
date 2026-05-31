BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[nhan_vien] (
    [id] NVARCHAR(1000) NOT NULL,
    [maNV] NVARCHAR(20) NOT NULL,
    [hoTen] NVARCHAR(100) NOT NULL,
    [vaiTro] NVARCHAR(20) NOT NULL,
    [matKhauHash] NVARCHAR(255) NOT NULL,
    [ngayVaoLam] DATETIME2 NOT NULL CONSTRAINT [nhan_vien_ngayVaoLam_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [nhan_vien_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [nhan_vien_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [nhan_vien_maNV_key] UNIQUE NONCLUSTERED ([maNV])
);

-- CreateTable
CREATE TABLE [dbo].[refresh_tokens] (
    [id] NVARCHAR(1000) NOT NULL,
    [nhanVienId] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(512) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [refresh_tokens_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [refresh_tokens_nhanVienId_key] UNIQUE NONCLUSTERED ([nhanVienId])
);

-- CreateTable
CREATE TABLE [dbo].[ban] (
    [id] NVARCHAR(1000) NOT NULL,
    [maBan] NVARCHAR(20) NOT NULL,
    [tenBan] NVARCHAR(100) NOT NULL,
    [viTri] NVARCHAR(100),
    [sucChua] INT NOT NULL CONSTRAINT [ban_sucChua_df] DEFAULT 4,
    [trangThai] NVARCHAR(20) NOT NULL CONSTRAINT [ban_trangThai_df] DEFAULT 'TRONG',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ban_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ban_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ban_maBan_key] UNIQUE NONCLUSTERED ([maBan])
);

-- CreateTable
CREATE TABLE [dbo].[mon_an] (
    [id] NVARCHAR(1000) NOT NULL,
    [maMon] NVARCHAR(20) NOT NULL,
    [tenMon] NVARCHAR(200) NOT NULL,
    [moTa] NVARCHAR(500),
    [hinhAnh] NVARCHAR(500),
    [donViTinh] NVARCHAR(50) NOT NULL CONSTRAINT [mon_an_donViTinh_df] DEFAULT 'phần',
    [giaGoc] FLOAT(53) NOT NULL,
    [danhMuc] NVARCHAR(100) NOT NULL CONSTRAINT [mon_an_danhMuc_df] DEFAULT 'Món chính',
    [isActive] BIT NOT NULL CONSTRAINT [mon_an_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [mon_an_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [mon_an_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [mon_an_maMon_key] UNIQUE NONCLUSTERED ([maMon])
);

-- CreateTable
CREATE TABLE [dbo].[thuc_don_ngay] (
    [id] NVARCHAR(1000) NOT NULL,
    [ngay] DATE NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [thuc_don_ngay_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [thuc_don_ngay_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [thuc_don_ngay_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [thuc_don_ngay_ngay_key] UNIQUE NONCLUSTERED ([ngay])
);

-- CreateTable
CREATE TABLE [dbo].[dong_thuc_don_ngay] (
    [id] NVARCHAR(1000) NOT NULL,
    [thucDonNgayId] NVARCHAR(1000) NOT NULL,
    [monAnId] NVARCHAR(1000) NOT NULL,
    [giaBanTrongNgay] FLOAT(53) NOT NULL,
    [trangThai] NVARCHAR(20) NOT NULL CONSTRAINT [dong_thuc_don_ngay_trangThai_df] DEFAULT 'CO_SAN',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [dong_thuc_don_ngay_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [dong_thuc_don_ngay_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [dong_thuc_don_ngay_thucDonNgayId_monAnId_key] UNIQUE NONCLUSTERED ([thucDonNgayId],[monAnId])
);

-- CreateTable
CREATE TABLE [dbo].[hoa_don_tam_tinh] (
    [id] NVARCHAR(1000) NOT NULL,
    [maHoaDonTamTinh] NVARCHAR(50) NOT NULL,
    [banId] NVARCHAR(1000) NOT NULL,
    [maTheThanhVien] NVARCHAR(50),
    [thoiDiemMo] DATETIME2 NOT NULL CONSTRAINT [hoa_don_tam_tinh_thoiDiemMo_df] DEFAULT CURRENT_TIMESTAMP,
    [tongTienTam] FLOAT(53) NOT NULL CONSTRAINT [hoa_don_tam_tinh_tongTienTam_df] DEFAULT 0,
    [daKhoa] BIT NOT NULL CONSTRAINT [hoa_don_tam_tinh_daKhoa_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [hoa_don_tam_tinh_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [hoa_don_tam_tinh_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [hoa_don_tam_tinh_maHoaDonTamTinh_key] UNIQUE NONCLUSTERED ([maHoaDonTamTinh])
);

-- CreateTable
CREATE TABLE [dbo].[phieu_order] (
    [id] NVARCHAR(1000) NOT NULL,
    [hoaDonTamTinhId] NVARCHAR(1000) NOT NULL,
    [thoiDiemDat] DATETIME2 NOT NULL CONSTRAINT [phieu_order_thoiDiemDat_df] DEFAULT CURRENT_TIMESTAMP,
    [ghiChu] NVARCHAR(500),
    [daXacNhan] BIT NOT NULL CONSTRAINT [phieu_order_daXacNhan_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [phieu_order_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [phieu_order_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[dong_order] (
    [id] NVARCHAR(1000) NOT NULL,
    [phieuOrderId] NVARCHAR(1000) NOT NULL,
    [monAnId] NVARCHAR(1000) NOT NULL,
    [soPhan] INT NOT NULL,
    [donGia] FLOAT(53) NOT NULL,
    [thanhTien] FLOAT(53) NOT NULL,
    [ghiChu] NVARCHAR(300),
    [trangThaiCheBien] NVARCHAR(20) NOT NULL CONSTRAINT [dong_order_trangThaiCheBien_df] DEFAULT 'CHO_CHE_BIEN',
    [thoiDiemHoanTat] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [dong_order_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [dong_order_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[hoa_don_thanh_toan] (
    [id] NVARCHAR(1000) NOT NULL,
    [maHoaDon] NVARCHAR(50) NOT NULL,
    [hoaDonTamTinhId] NVARCHAR(1000) NOT NULL,
    [thuNganId] NVARCHAR(1000) NOT NULL,
    [tenNhaHang] NVARCHAR(200) NOT NULL,
    [diaChi] NVARCHAR(300),
    [thoiGianThanhToan] DATETIME2 NOT NULL CONSTRAINT [hoa_don_thanh_toan_thoiGianThanhToan_df] DEFAULT CURRENT_TIMESTAMP,
    [tongTienHoaDon] FLOAT(53) NOT NULL,
    [hinhThucThanhToan] NVARCHAR(20) NOT NULL,
    [tienKhachDua] FLOAT(53) NOT NULL,
    [tienTraLai] FLOAT(53) NOT NULL,
    [maTheThanhVien] NVARCHAR(50),
    [diemCongThem] FLOAT(53),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [hoa_don_thanh_toan_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [hoa_don_thanh_toan_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [hoa_don_thanh_toan_maHoaDon_key] UNIQUE NONCLUSTERED ([maHoaDon]),
    CONSTRAINT [hoa_don_thanh_toan_hoaDonTamTinhId_key] UNIQUE NONCLUSTERED ([hoaDonTamTinhId])
);

-- CreateTable
CREATE TABLE [dbo].[dong_hoa_don] (
    [id] NVARCHAR(1000) NOT NULL,
    [hoaDonThanhToanId] NVARCHAR(1000) NOT NULL,
    [tenMon] NVARCHAR(200) NOT NULL,
    [soPhan] INT NOT NULL,
    [donGia] FLOAT(53) NOT NULL,
    [thanhTien] FLOAT(53) NOT NULL,
    CONSTRAINT [dong_hoa_don_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[the_thanh_vien] (
    [id] NVARCHAR(1000) NOT NULL,
    [maThe] NVARCHAR(50) NOT NULL,
    [hoTen] NVARCHAR(100) NOT NULL,
    [soDienThoai] NVARCHAR(20) NOT NULL,
    [ngayPhatHanh] DATETIME2 NOT NULL CONSTRAINT [the_thanh_vien_ngayPhatHanh_df] DEFAULT CURRENT_TIMESTAMP,
    [ngayHetHan] DATETIME2 NOT NULL,
    [tongDiem] INT NOT NULL CONSTRAINT [the_thanh_vien_tongDiem_df] DEFAULT 0,
    [trangThai] NVARCHAR(20) NOT NULL CONSTRAINT [the_thanh_vien_trangThai_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [the_thanh_vien_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [the_thanh_vien_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [the_thanh_vien_maThe_key] UNIQUE NONCLUSTERED ([maThe])
);

-- CreateTable
CREATE TABLE [dbo].[lich_su_tich_diem] (
    [id] NVARCHAR(1000) NOT NULL,
    [theThanhVienId] NVARCHAR(1000) NOT NULL,
    [maHoaDon] NVARCHAR(50),
    [soTien] FLOAT(53) NOT NULL,
    [diemCong] INT NOT NULL,
    [tongDiemSauCong] INT NOT NULL,
    [ngayGiao] DATETIME2 NOT NULL CONSTRAINT [lich_su_tich_diem_ngayGiao_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [lich_su_tich_diem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[bao_cao_doanh_thu] (
    [id] NVARCHAR(1000) NOT NULL,
    [maBaoCao] NVARCHAR(50) NOT NULL,
    [ngayBaoCao] DATE NOT NULL,
    [thoiDiemLap] DATETIME2 NOT NULL CONSTRAINT [bao_cao_doanh_thu_thoiDiemLap_df] DEFAULT CURRENT_TIMESTAMP,
    [nguoiLapId] NVARCHAR(1000) NOT NULL,
    [tongSoHoaDon] INT NOT NULL,
    [tongDoanhThu] FLOAT(53) NOT NULL,
    [ghiChu] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [bao_cao_doanh_thu_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [bao_cao_doanh_thu_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [bao_cao_doanh_thu_maBaoCao_key] UNIQUE NONCLUSTERED ([maBaoCao])
);

-- CreateTable
CREATE TABLE [dbo].[dong_bao_cao] (
    [id] NVARCHAR(1000) NOT NULL,
    [baoCaoDoanhThuId] NVARCHAR(1000) NOT NULL,
    [hoaDonThanhToanId] NVARCHAR(1000) NOT NULL,
    [maMon] NVARCHAR(20) NOT NULL,
    [tenMon] NVARCHAR(200) NOT NULL,
    [soLuongDaBan] INT NOT NULL,
    [doanhThuMon] FLOAT(53) NOT NULL,
    CONSTRAINT [dong_bao_cao_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[refresh_tokens] ADD CONSTRAINT [refresh_tokens_nhanVienId_fkey] FOREIGN KEY ([nhanVienId]) REFERENCES [dbo].[nhan_vien]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_thuc_don_ngay] ADD CONSTRAINT [dong_thuc_don_ngay_thucDonNgayId_fkey] FOREIGN KEY ([thucDonNgayId]) REFERENCES [dbo].[thuc_don_ngay]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_thuc_don_ngay] ADD CONSTRAINT [dong_thuc_don_ngay_monAnId_fkey] FOREIGN KEY ([monAnId]) REFERENCES [dbo].[mon_an]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hoa_don_tam_tinh] ADD CONSTRAINT [hoa_don_tam_tinh_banId_fkey] FOREIGN KEY ([banId]) REFERENCES [dbo].[ban]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hoa_don_tam_tinh] ADD CONSTRAINT [hoa_don_tam_tinh_maTheThanhVien_fkey] FOREIGN KEY ([maTheThanhVien]) REFERENCES [dbo].[the_thanh_vien]([maThe]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[phieu_order] ADD CONSTRAINT [phieu_order_hoaDonTamTinhId_fkey] FOREIGN KEY ([hoaDonTamTinhId]) REFERENCES [dbo].[hoa_don_tam_tinh]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_order] ADD CONSTRAINT [dong_order_phieuOrderId_fkey] FOREIGN KEY ([phieuOrderId]) REFERENCES [dbo].[phieu_order]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_order] ADD CONSTRAINT [dong_order_monAnId_fkey] FOREIGN KEY ([monAnId]) REFERENCES [dbo].[mon_an]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hoa_don_thanh_toan] ADD CONSTRAINT [hoa_don_thanh_toan_hoaDonTamTinhId_fkey] FOREIGN KEY ([hoaDonTamTinhId]) REFERENCES [dbo].[hoa_don_tam_tinh]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[hoa_don_thanh_toan] ADD CONSTRAINT [hoa_don_thanh_toan_thuNganId_fkey] FOREIGN KEY ([thuNganId]) REFERENCES [dbo].[nhan_vien]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_hoa_don] ADD CONSTRAINT [dong_hoa_don_hoaDonThanhToanId_fkey] FOREIGN KEY ([hoaDonThanhToanId]) REFERENCES [dbo].[hoa_don_thanh_toan]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[lich_su_tich_diem] ADD CONSTRAINT [lich_su_tich_diem_theThanhVienId_fkey] FOREIGN KEY ([theThanhVienId]) REFERENCES [dbo].[the_thanh_vien]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[bao_cao_doanh_thu] ADD CONSTRAINT [bao_cao_doanh_thu_nguoiLapId_fkey] FOREIGN KEY ([nguoiLapId]) REFERENCES [dbo].[nhan_vien]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_bao_cao] ADD CONSTRAINT [dong_bao_cao_baoCaoDoanhThuId_fkey] FOREIGN KEY ([baoCaoDoanhThuId]) REFERENCES [dbo].[bao_cao_doanh_thu]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dong_bao_cao] ADD CONSTRAINT [dong_bao_cao_hoaDonThanhToanId_fkey] FOREIGN KEY ([hoaDonThanhToanId]) REFERENCES [dbo].[hoa_don_thanh_toan]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
