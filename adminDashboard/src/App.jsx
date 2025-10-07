import { useState } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import LayoutPage from './pages/LayoutPage'
import ErrorPage from './pages/ErrorPAge'
import Machines from './pages/Machine'
import MachineTimeFrames from './pages/TimeFrame'
import AdminManagement from './pages/User'
import GameSessions from './pages/GameSessions'
import GameManagement from './pages/GameManagement'
import ProfilePage from './pages/Page'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './apis/apiUtils'
import { ToastContainer } from 'react-toastify'

function App() {

  const routes = createBrowserRouter([
    {
      path: '/',
      element: <LayoutPage />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: '/machines',
          element: <Machines />
        },
        {
          path: '/timeframes',
          element: <MachineTimeFrames />
        },
        {
          path: '/sessions',
          element: <GameSessions />
        },
        {
          path: '/game-management',
          element: <GameManagement />
        },
        {
          path: '/users',
          element: <AdminManagement />
        },
        {
          path: '/profile',
          element: <ProfilePage />
        },
        {
          path: '/change-password',
          element: <ChangePassword />
        }
      ]
    },
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />
    },
    {
      path: '/reset-password',
      element: <ResetPassword />
    }
  ])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
      <ToastContainer icon={false} />
    </QueryClientProvider>
  )
}

export default App
