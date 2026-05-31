import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function addYears(date, years) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...')

  const PASS = await bcrypt.hash('123456', 10)

  // ── Nhân viên ──────────────────────────────────────────────────────────────
  const staff = [
    { maNV: 'BT001', hoTen: 'Nguyễn Văn Bếp Trưởng', vaiTro: 'BEP_TRUONG' },
    { maNV: 'DB001', hoTen: 'Trần Thị Đầu Bếp',       vaiTro: 'DAU_BEP'    },
    { maNV: 'DB002', hoTen: 'Lê Văn Đầu Bếp',         vaiTro: 'DAU_BEP'    },
    { maNV: 'DB003', hoTen: 'Hoàng Minh Tuấn',        vaiTro: 'DAU_BEP'    },
    { maNV: 'TN001', hoTen: 'Phạm Thu Ngân',           vaiTro: 'THU_NGAN'   },
  ]
  for (const s of staff) {
    await prisma.nhanVien.upsert({
      where:  { maNV: s.maNV },
      update: {},
      create: { ...s, matKhauHash: PASS },
    })
  }
  console.log(`  ✅ ${staff.length} nhân viên`)

  // ── Bàn ────────────────────────────────────────────────────────────────────
  const tables = [
    { maBan: 'B01',  tenBan: 'Bàn 1',  viTri: 'Khu A',   sucChua: 4  },
    { maBan: 'B02',  tenBan: 'Bàn 2',  viTri: 'Khu A',   sucChua: 4  },
    { maBan: 'B03',  tenBan: 'Bàn 3',  viTri: 'Khu A',   sucChua: 6  },
    { maBan: 'B04',  tenBan: 'Bàn 4',  viTri: 'Khu B',   sucChua: 4  },
    { maBan: 'B05',  tenBan: 'Bàn 5',  viTri: 'Khu B',   sucChua: 4  },
    { maBan: 'B06',  tenBan: 'Bàn 6',  viTri: 'Khu B',   sucChua: 6  },
    { maBan: 'B07',  tenBan: 'Bàn 7',  viTri: 'Khu C',   sucChua: 2  },
    { maBan: 'B08',  tenBan: 'Bàn 8',  viTri: 'Khu C',   sucChua: 8  },
    { maBan: 'VIP1', tenBan: 'VIP 1',  viTri: 'Khu VIP', sucChua: 10 },
    { maBan: 'VIP2', tenBan: 'VIP 2',  viTri: 'Khu VIP', sucChua: 12 },
  ]
  for (const t of tables) {
    await prisma.ban.upsert({ where: { maBan: t.maBan }, update: {}, create: t })
  }
  console.log(`  ✅ ${tables.length} bàn`)

  // ── Món ăn ─────────────────────────────────────────────────────────────────
  const foods = [
    { maMon: 'KV001', tenMon: 'Gỏi cuốn tôm thịt',   danhMuc: 'Khai vị',     giaGoc: 35000 },
    { maMon: 'KV002', tenMon: 'Chả giò thịt heo',     danhMuc: 'Khai vị',     giaGoc: 30000 },
    { maMon: 'KV003', tenMon: 'Súp bào ngư',          danhMuc: 'Khai vị',     giaGoc: 55000 },
    { maMon: 'MC001', tenMon: 'Phở bò tái chín',      danhMuc: 'Món chính',   giaGoc: 65000 },
    { maMon: 'MC002', tenMon: 'Bún bò Huế',           danhMuc: 'Món chính',   giaGoc: 60000 },
    { maMon: 'MC003', tenMon: 'Cơm tấm sườn bì chả', danhMuc: 'Món chính',   giaGoc: 55000 },
    { maMon: 'MC004', tenMon: 'Bún chả Hà Nội',       danhMuc: 'Món chính',   giaGoc: 60000 },
    { maMon: 'MC005', tenMon: 'Mì Quảng gà',          danhMuc: 'Món chính',   giaGoc: 58000 },
    { maMon: 'MC006', tenMon: 'Cháo lươn Nghệ An',    danhMuc: 'Món chính',   giaGoc: 62000 },
    { maMon: 'MC007', tenMon: 'Bánh canh cua',        danhMuc: 'Món chính',   giaGoc: 65000 },
    { maMon: 'TM001', tenMon: 'Chè ba màu',           danhMuc: 'Tráng miệng', giaGoc: 25000 },
    { maMon: 'TM002', tenMon: 'Sữa chua mít',         danhMuc: 'Tráng miệng', giaGoc: 28000 },
    { maMon: 'TM003', tenMon: 'Bánh flan caramel',    danhMuc: 'Tráng miệng', giaGoc: 22000 },
    { maMon: 'DU001', tenMon: 'Trà đá',               danhMuc: 'Đồ uống',     giaGoc: 10000 },
    { maMon: 'DU002', tenMon: 'Nước chanh tươi',      danhMuc: 'Đồ uống',     giaGoc: 25000 },
    { maMon: 'DU003', tenMon: 'Sinh tố xoài',         danhMuc: 'Đồ uống',     giaGoc: 35000 },
    { maMon: 'DU004', tenMon: 'Cà phê sữa đá',       danhMuc: 'Đồ uống',     giaGoc: 30000 },
    { maMon: 'DU005', tenMon: 'Nước ép bưởi',         danhMuc: 'Đồ uống',     giaGoc: 30000 },
    { maMon: 'DU006', tenMon: 'Trà hoa cúc',          danhMuc: 'Đồ uống',     giaGoc: 20000 },
  ]
  for (const f of foods) {
    await prisma.monAn.upsert({
      where:  { maMon: f.maMon },
      update: {},
      create: { ...f, donViTinh: 'phần' },
    })
  }
  console.log(`  ✅ ${foods.length} món ăn`)

  // ── Thực đơn hôm nay ───────────────────────────────────────────────────────
  const now      = new Date()
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

  const existingMenu = await prisma.thucDonNgay.findFirst({
    where: { ngay: { gte: today, lt: tomorrow } },
  })

  if (!existingMenu) {
    const allFoods = await prisma.monAn.findMany({ where: { isActive: true } })
    await prisma.thucDonNgay.create({
      data: {
        ngay: today,
        dongThucDon: {
          create: allFoods.map((f) => ({ monAnId: f.id, giaBanTrongNgay: f.giaGoc })),
        },
      },
    })
    console.log(`  ✅ Thực đơn hôm nay (${allFoods.length} món)`)
  } else {
    console.log('  ℹ️  Thực đơn hôm nay đã tồn tại')
  }

  // ── Thẻ thành viên ─────────────────────────────────────────────────────────
  const cards = [
    { maThe: 'THE001', hoTen: 'Nguyễn Văn An', soDienThoai: '0901234567', ngayHetHan: addYears(new Date(), 2), tongDiem: 1250 },
    { maThe: 'THE002', hoTen: 'Trần Thị Bình', soDienThoai: '0912345678', ngayHetHan: addYears(new Date(), 1), tongDiem: 380  },
    { maThe: 'THE003', hoTen: 'Lê Minh Châu',  soDienThoai: '0923456789', ngayHetHan: addYears(new Date(), 3), tongDiem: 4700 },
  ]
  for (const c of cards) {
    await prisma.theThanhVien.upsert({
      where: { maThe: c.maThe }, update: {}, create: c,
    })
  }
  console.log(`  ✅ ${cards.length} thẻ thành viên`)

  console.log('\n🎉 Seed hoàn tất!')
  console.log('─────────────────────────────────────')
  console.log('  BT001 / 123456 → Bếp trưởng → /kitchen')
  console.log('  DB001 / 123456 → Đầu bếp    → /kitchen/kds')
  console.log('  DB002 / 123456 → Đầu bếp    → /kitchen/kds')
  console.log('  DB003 / 123456 → Đầu bếp    → /kitchen/kds')
  console.log('  TN001 / 123456 → Thu ngân   → /cashier')
  console.log('  Tablet bàn     → /table/B01/menu')
  console.log('  Thẻ TV         → THE001 · THE002 · THE003')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => { console.error('❌ Seed thất bại:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
