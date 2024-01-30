import React from 'react'

import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/home/home'
import { Login } from './pages/login/login'
import { Register } from './pages/register/register'
import { Dashboard } from './pages/dashboard/dashboard'
import { New } from './pages/dashboard/new/new'
import { CarDetail } from './pages/car/car'
import { Private } from './routes/Private'

import { Layout } from './components/Layout/Layout'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/car/:id",
          element: <CarDetail />
        },
        {
          path: "/dashboard",
          element: <Private><Dashboard /></Private>
        },
        {
          path: "/dashboard/new",
          element: <Private><New /></Private>
        }
      ]
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    }
  ]
)

export { router }