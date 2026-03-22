import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    const scroll = () => {
      if (location.hash) {
        const id = location.hash.replace("#", "")
        const element = document.getElementById(id)

        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }
    }

    // 🔥 Delay para asegurar render del DOM
    setTimeout(scroll, 100)

  }, [location.pathname, location.hash])

  return null
}