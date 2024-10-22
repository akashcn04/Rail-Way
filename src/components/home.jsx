import React from 'react'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function home() {
    useGSAP(()=>
        {
          gsap.to("#heading",{
            bottom:0,
            opacity:1,
            duration:2,
            delay:1
          }),
          gsap.to("#train",{
            right:-100,
            opacity:1,
            duration:2,
            delay:2
          })
        })
  return (
    <main className="pt-16">
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
          <div className="container mx-auto px-4 flex justify-between">
            <div>
            <h1 className="text-5xl font-bold mb-4" id='heading' style={{position: 'relative', bottom: '-30px',opacity:0}}>Welcome to Rail-Way</h1>
            <p className="text-xl mb-8" id='heading' style={{position: 'relative', bottom: '-30px',opacity:0}}>Your one-stop solution for all railway-related services.</p>
            <button className="bg-white text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-md text-lg font-medium transition duration-150 ease-in-out">
              Book Your Journey
            </button>
            </div>
            <div >
              <div style={{position:'relative' ,right:'-1200px',opacity:1}} id='train'>
              <img src="public/assets/train1.png" alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {['PNR Status', 'Train Schedule', 'Book Ticket'].map((service) => (
                <div key={service} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-150 ease-in-out">
                  <h3 className="text-xl font-semibold mb-2">{service}</h3>
                  <p className="text-gray-600">Access our {service.toLowerCase()} service with just a few clicks.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
  )
}

export default home