import React from 'react'
import { Layout } from '../components/layout'
import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken } from '../utils/storageUtils'

function LayoutPage() {
  const accessToken = getAccessToken()

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