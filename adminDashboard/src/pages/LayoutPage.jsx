import React from 'react'
import { Layout } from '../components/layout'
import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken, getRefreshToken } from '../utils/storageUtils'

function LayoutPage() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if(!accessToken){
    return <Navigate to="/login" />
  }

  return (
    <Layout>
        <Outlet />
    </Layout>
  )
}

export default LayoutPage