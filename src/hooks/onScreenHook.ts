// https://stackoverflow.com/questions/45514676/how-to-check-if-element-is-visible-in-dom
import React, {useState, useMemo, useEffect} from "react"

const useOnScreen = (ref: React.RefObject<HTMLElement>, root: React.RefObject<HTMLElement>) => {

  const [isIntersecting, setIntersecting] = useState(false)

  const observer = useMemo(() => new IntersectionObserver(
    ([entry]) => setIntersecting(entry.isIntersecting)
  ,{root: root.current, threshold: 1.0, rootMargin:"0px"}), [ref])


  useEffect(() => {
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return isIntersecting
}
export default useOnScreen;