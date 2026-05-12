import { Outlet } from 'react-router-dom'
import Navbar from '../sections/Navbar'
import ChatBot from '../chatbot/ChatBot'

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ChatBot />
    </div>
  )
}
