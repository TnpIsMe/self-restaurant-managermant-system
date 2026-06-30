/*
  Warnings:

  - A unique constraint covering the columns `[ngayBaoCao]` on the table `bao_cao_doanh_thu` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[hoa_don_thanh_toan] ADD [soLanIn] INT NOT NULL CONSTRAINT [hoa_don_thanh_toan_soLanIn_df] DEFAULT 0,
[thoiGianInGanNhat] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[mon_an] DROP CONSTRAINT [mon_an_danhMuc_df],
[mon_an_donViTinh_df];
ALTER TABLE [dbo].[mon_an] ADD CONSTRAINT [mon_an_danhMuc_df] DEFAULT 'Món chính' FOR [danhMuc], CONSTRAINT [mon_an_donViTinh_df] DEFAULT 'phần' FOR [donViTinh];

-- CreateIndex
ALTER TABLE [dbo].[bao_cao_doanh_thu] ADD CONSTRAINT [bao_cao_doanh_thu_ngayBaoCao_key] UNIQUE NONCLUSTERED ([ngayBaoCao]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
