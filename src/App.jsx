import React from 'react'
import Navbar from './components/Navbar'
import Home from './components/home';

function App() {

  return (
    <div className="App bg-gray-100 min-h-screen">
      <Navbar />
      <Home />
    </div>
  )
}

export default App