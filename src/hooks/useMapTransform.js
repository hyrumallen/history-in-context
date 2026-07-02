import { useState, useCallback, useRef } from 'react'

const MIN_SCALE = 1
const MAX_SCALE = 12

function clampT(t) {
  if (t.scale <= 1.001) return { scale: Math.max(1, t.scale), translateX: 0, translateY: 0 }
  const margin = 80
  const maxX = margin
  const minX = -800 * (t.scale - 1) - margin
  const maxY = margin
  const minY = -400 * (t.scale - 1) - margin
  return {
    scale: t.scale,
    translateX: Math.min(maxX, Math.max(minX, t.translateX)),
    translateY: Math.min(maxY, Math.max(minY, t.translateY)),
  }
}

export default function useMapTransform() {
  const [transform, setTransform] = useState({ scale: 1, translateX: 0, translateY: 0 })
  const transformRef = useRef({ scale: 1, translateX: 0, translateY: 0 })
  const dragRef = useRef(null)

  const apply = useCallback((t) => {
    transformRef.current = t
    setTransform(t)
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const prev = transformRef.current
    const factor = e.deltaY > 0 ? 0.85 : 1.18
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor))
    const ratio = newScale / prev.scale
    apply(clampT({
      scale: newScale,
      translateX: mx - ratio * (mx - prev.translateX),
      translateY: my - ratio * (my - prev.translateY),
    }))
  }, [apply])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      base: { ...transformRef.current },
    }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const { startX, startY, base } = dragRef.current
    apply(clampT({
      scale: base.scale,
      translateX: base.translateX + (e.clientX - startX),
      translateY: base.translateY + (e.clientY - startY),
    }))
  }, [apply])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const onDoubleClick = useCallback(() => {
    dragRef.current = null
    apply({ scale: 1, translateX: 0, translateY: 0 })
  }, [apply])

  return {
    transform,
    handlers: { onWheel, onMouseDown, onMouseMove, onMouseUp, onDoubleClick },
  }
}
