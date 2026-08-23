import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import AppLayout from './components/layout/AppLayout'
import DashboardHome from './pages/DashboardHome'
import GroupsPage from './pages/GroupsPage'
import MinistriesPage from './pages/MinistriesPage'
import './App.css'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/ministries" element={<MinistriesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
