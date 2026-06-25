import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROLES } from '@/constants/roles'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import KitchenLayout from '@/components/layout/KitchenLayout'
import CashierLayout from '@/components/layout/CashierLayout'

import LoginPage from '@/pages/auth/LoginPage'
import TableMenuPage from '@/pages/table/TableMenuPage'
import TableOrderPage from '@/pages/table/TableOrderPage'
import TableInvoicePage from '@/pages/table/TableInvoicePage'
import TableMemberCardPage from '@/pages/table/TableMemberCardPage'
import KDSPage from '@/pages/kitchen/KDSPage'
import FoodCatalogPage from '@/pages/kitchen/FoodCatalogPage'
import DailyMenuPage from '@/pages/kitchen/DailyMenuPage'
import PaymentPage from '@/pages/cashier/PaymentPage'
import InvoiceHistoryPage from '@/pages/cashier/InvoiceHistoryPage'
import RevenueReportPage from '@/pages/cashier/RevenueReportPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/table/:tableId', children: [
    { index: true, element: <Navigate to="menu" replace /> },
    { path: 'menu',        element: <TableMenuPage /> },
    { path: 'order',       element: <TableOrderPage /> },
    { path: 'invoice',     element: <TableInvoicePage /> },
    { path: 'member-card', element: <TableMemberCardPage /> },
  ]},
  { element: <ProtectedRoute allowedRoles={[ROLES.BEP_TRUONG, ROLES.DAU_BEP]} />, children: [{
    path: '/kitchen', element: <KitchenLayout />, children: [
      { index: true, element: <Navigate to="kds" replace /> },
      { path: 'kds',          element: <KDSPage /> },
      { path: 'food-catalog', element: <FoodCatalogPage /> },
      { path: 'daily-menu',   element: <DailyMenuPage /> },
    ],
  }]},
  { element: <ProtectedRoute allowedRoles={[ROLES.THU_NGAN]} />, children: [{
    path: '/cashier', element: <CashierLayout />, children: [
      { index: true, element: <Navigate to="payment" replace /> },
      { path: 'payment',         element: <PaymentPage /> },
      { path: 'invoice-history', element: <InvoiceHistoryPage /> },
      { path: 'report',          element: <RevenueReportPage /> },
    ],
  }]},
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
], {
  future: {
    v7_startTransition: true,
  },
})
