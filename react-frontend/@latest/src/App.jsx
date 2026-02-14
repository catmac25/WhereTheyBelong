import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import RegisterNewCase from './components /registerCase.jsx'
import ThemeToggle from './components /ThemeToggle.jsx'
import CursorFollower from './components /CursorFollower.jsx'
import WavyText from './components /WavyText.jsx'
import NewsFeed from './components /NewsFeed.jsx'
import MatchPage from './components /MatchCases.jsx'
import SideBanner from './components /SideBanner.jsx'
import { AiFillHeart } from "react-icons/ai";
import Carousel from './components /Carousel.jsx'
import TeamCarousel from './components /TeamCarousel.jsx'
import Footer from './components /Footer.jsx'
import AdminLogin from './components /AdminLogin.jsx'
import { AdminAuthProvider, useAdminAuth } from './components /AdminAuthContext.jsx'
import { UserAuthProvider, useUserAuth } from './components /UserAuthContext.jsx'
import AdminDashboard from './components /AdminDashboard.jsx'
import RegisteredCasesList from './components /RegisteredCases.jsx'
import UserLogin from './components /UserLogin.jsx'
import { io } from "socket.io-client";
import UserDashboard from './components /UserDashboard.jsx'
import PublicSubmissions from './components /PublicSubmissions.jsx'
import { NotificationProvider } from './components /NotificationContext.jsx'
import NotificationBell from './components /NotificationBell.jsx'
import ViewDetails from './components /ViewDetails.jsx'
import PublicCasesList from './components /PublicCases.jsx'
import UserProfile from './components /UserProfile.jsx'
import MatchedData from './components /MatchedData.jsx'
import PublicMap from './components /PublicMap.jsx'
function AppContent() {
  const location = useLocation()
  const { isAdmin } = useAdminAuth();
  const { logout } = useAdminAuth();
  const { user, loguserout } = useUserAuth();
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to Socket.io:", socket.id);

      // Register current user (only if logged in)
      if (user?.email) {
        socket.emit("register", user.email);
        console.log("Registered for notifications:", user.email);
      }
    });

    socket.on("notification", (data) => {
      console.log("🔔 Notification received:", data);
      alert(`${data.title}\n\n${data.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.email]);

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  }
  const handleUserLogout = () => {
    loguserout();
    navigate("/");
  };
  function UserLoginWrapper() {
    const navigate = useNavigate();
    const { user, login } = useUserAuth();

    useEffect(() => {
      if (user) navigate("/user-dashboard");
    }, [user]);

    return (
      <UserLogin
        onLogin={(token, userData) => {
          login(token, userData);
          navigate("/user-dashboard");
        }}
      />
    );
  }

  return (
    <>
      {!user && !isAdmin && (  <SideBanner href="/login" text="Click to login" visible={true} />)}
      {!isAdmin && !user && (
        <nav className="flex items-center gap-3 p-3 mx-10 ">
          <Link to="/" className="text-lg hover:text-xl"><AiFillHeart /></Link>
          <Link to="/" className="text-sm hover:text-xl">Home</Link>
          <Link to="/publicsubmission" className="text-sm hover:text-xl">Report A Sighting</Link>
          <Link to="/adminlogin" className='text-sm hover:text-xl'>Login as Admin</Link>
          <span className="ml-auto" />
          <ThemeToggle />
        </nav>
      )}
      {isAdmin && (
        <nav className="flex items-center gap-3 p-3 mx-10 ">
          <Link to="/" className="text-lg hover:text-xl"><AiFillHeart /></Link>
          <Link to="/dashboard" className="text-sm hover:text-xl"> Home </Link>
          <Link to="/allcases" className='text-sm hover:text-xl'>Registered Cases</Link>
          <Link to="/publiccases" className='text-sm hover:text-xl'>Public Sightings</Link>
          <button onClick={handleLogout}>Logout </button>
          <ThemeToggle />
        </nav>
      )}
      {user && !isAdmin && (
        <nav className="flex items-center gap-3 p-3 mx-10 ">
          <Link to="/" className="text-lg hover:text-xl"><AiFillHeart /></Link>
          <Link to="/user-dashboard" className="text-sm hover:text-xl">Dashboard</Link>
          <Link to="/profile" className="text-sm hover:text-xl">Profile</Link>
          <Link to="/register" className="text-sm hover:text-xl">Register Case</Link>
          
          <NotificationBell/>
          <button onClick={handleUserLogout} className="text-sm hover:text-xl">Logout</button>
          <span className="ml-auto flex items-center gap-2 mr-17 text-lg font-semibold">
            👋 Hello, <span className="">{user?.name || "User"}</span>
          </span>
          <ThemeToggle />
        </nav>
      )}
      <Routes>
        <Route path="/" element={
          <div className="mx-10 my-12">
            <div className="flex justify-center items-center">
              <WavyText text="Where They Belong" className="text-5xl md:text-6xl font-bold" />
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 max-w-6xl mx-auto">
              <div className="md:col-span-7">
                <h3 className="mb-3 mx-4 sticky top-10 text-3xl font-semibold heading-color">Latest News</h3>
                <NewsFeed />
              </div>

              <aside className="md:col-span-5">
                <h3 className="mb-1 mx-4 sticky top-10 text-2xl font-semibold heading-color">What are we ?</h3>
                <div className="sticky top-20 card-surface p-4 leading-relaxed surface-text text-lg">
                  This platform empowers families and authorities to register, identify, and monitor missing person cases with compassion and precision. By combining advanced facial recognition technology with a user-friendly interface, it streamlines the process of reporting and matching cases in real time. The system ensures data accuracy through AI-driven analysis while maintaining user privacy and security.
                </div>

                <div className="mt-3 text-lg card-surface p-4 leading-relaxed surface-text">
                  Together, we strive to bring hope, connection, and closure — 🌏 uniting technology with humanity.
                </div>
              </aside>
            </div>

            <div className="my-12" />
            <section className="max-w-6xl mx-auto">
              <h3 className="mb-4 text-4xl font-semibold heading-color text-center">How do we do it but ?</h3>
              <div style={{ padding: "50px" }}>
                <Carousel />
              </div>
              <p className='text-center text-lg'>
                Our system, built primarily in Python, integrates advanced AI and modern web technologies for efficient facial recognition. TensorFlow handles CNN-based model training and inference, while MediaPipe extracts real-time facial landmarks and OpenCV manages image preprocessing such as resizing and noise reduction. Streamlit powers the interactive web and mobile interfaces, and Scikit-learn implements the K-Nearest Neighbors (KNN) Ball Tree algorithm for fast similarity searches. SQLite serves as a lightweight embedded database for storing user data, facial embeddings, and match logs, ensuring portability and easy deployment.
              </p>
            </section>

            <section className='max-w-6xl mx-auto'>
              <h3 className="mb-4 mt-20 text-4xl font-semibold heading-color text-center">Meet The Team</h3>
              <div style={{ padding: "50px" }} className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start py-12'>
                <TeamCarousel />
                <div className="flex-col items-center justify-center">
                  <p className='w-110 mt-20 text-xl font-bold'>We all are students 🧑🏻‍🎓 👩🏻‍🎓 at NSUT but we , </p>
                  <p className='w-110 mt-5 ml-10 text-xl'>Built this with a lot of love, hope, and dedication </p>
                  <p className='w-110 mt-3 ml-15 text-xl'>— ❤️ from our team to every family searching for their loved ones ...</p>
                </div>
              </div>
            </section>
          </div>
        } />
        <Route path="/register" element={<RegisterNewCase />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/allcases" element={<RegisteredCasesList />} />
        <Route path="/login" element={<UserLoginWrapper />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/publicsubmission" element={<PublicSubmissions />} />
        <Route path="/casedetails/:id" element = {<ViewDetails/>}/>
        <Route path="/publiccases" element= {<PublicCasesList/>}/>
        <Route path="/profile" element = {<UserProfile/>}/>
        <Route path = "/matched/:id" element = {<MatchedData/>}/>
        <Route path = "/viewmap/:id" element = {<PublicMap/>}/>
      </Routes>

      <CursorFollower />
      {location.pathname === '/' && (
        <footer>
          <Footer company="Where They Belong ❤️" />
        </footer>
      )}
    </>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <UserAuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </UserAuthProvider>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
