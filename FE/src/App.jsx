import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Atmosphere from './components/Atmosphere.jsx';
import CaseEntry, { shouldShowEntry } from './components/CaseEntry.jsx';
import InkSplash from './components/InkSplash.jsx';
import ChatFab from './components/ChatFab.jsx';
import Home from './pages/Home.jsx';
import Team from './pages/Team.jsx';
import Profile from './pages/Profile.jsx';
import Projects from './pages/Projects.jsx';
import Chat from './pages/Chat.jsx';
import Settings from './pages/Settings.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { pathname } = useLocation();

  // หน้าเปิดแฟ้มคดี: ตัดสินใจครั้งเดียวตอนเปิดเว็บ
  const [showEntry, setShowEntry] = useState(() => shouldShowEntry(pathname));
  const closeEntry = useCallback(() => setShowEntry(false), []);

  // เปลี่ยนหน้าแล้วเลื่อนกลับไปบนสุด
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Atmosphere />
      <Nav />
      <main className="container" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatFab />
      <InkSplash />
      {showEntry && <CaseEntry onDone={closeEntry} />}
    </>
  );
}
