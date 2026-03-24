import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import RootLayout from "./RootLayout"
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Logout from './pages/Logout'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import SinglePost from './pages/SinglePost'
import MessagesList from './components/MessagesList'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Groups from './pages/Groups'
import SingleGroup from './pages/SingleGroup'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'messages', element: <MessagesList /> },
      { path: 'messages/:receiverId', element: <Messages /> },
      { path: 'users/:id', element: <Profile /> },
      { path: 'posts/:id', element: <SinglePost /> },
      { path: 'groups', element: <Groups /> },
      { path: 'groups/:id', element: <SingleGroup /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/logout', element: <Logout /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App