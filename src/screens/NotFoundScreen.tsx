import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundScreen() {
  const [stars, setStars] = useState<{ x: number; y: number; size: number }[]>([])

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
      }))
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
      {stars.map((star, index) => (
        <motion.div
          key={index}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}
      <div className="text-center z-10">
        <motion.h1
          className="text-6xl font-bold text-white mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Page Not Found
        </motion.h1>
        <motion.p
          className="text-xl text-blue-200 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
         The page you're looking for doesn't exist.
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            Back to Homepage
          </Link>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#4299e1"
            fillOpacity="0.5"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,234.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </motion.div>
    </div>
  )
}