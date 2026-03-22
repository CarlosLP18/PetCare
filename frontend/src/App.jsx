import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import CreateCampaign from './pages/CreateCampaign'
import Footer from './components/Footer'
import ScrollToHash from "./components/ScrollToHash"

function App() {
  return (
    <>
      <ScrollToHash />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App