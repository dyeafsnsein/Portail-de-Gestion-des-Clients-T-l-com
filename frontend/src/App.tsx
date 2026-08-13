import { Navigate, Route, Routes } from 'react-router'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import Contracts from '@/pages/Contracts'
import Resources from '@/pages/Resources'
import Services from '@/pages/Services'
import Accessories from '@/pages/Accessories'
import Orders from '@/pages/Orders'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import { useAuth } from '@/lib/auth'

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        element={token ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="resources" element={<Resources />} />
        <Route path="services" element={<Services />} />
        <Route path="accessories" element={<Accessories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
