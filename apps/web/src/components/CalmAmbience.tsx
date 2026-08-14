import { useEffect, useRef, useState } from 'react'
import type { DictKey } from '../content'

type Props = {
  tx: (key: DictKey) => string
}

const CHANT_SRC = '/audio/om-gan-ganapataye.mp3'

/** Optional Om Gan Ganapataye chant — starts only when the visitor taps. */
export function CalmAmbience({ tx }: Props) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(CHANT_SRC)
    audio.loop = true
    audio.preload = 'none'
    audio.volume = 0.55
    audioRef.current = audio

    const onEnded = () => setPlaying(false)
    audio.addEventListener('pause', onEnded)
    return () => {
      audio.pause()
      audio.removeEventListener('pause', onEnded)
      audioRef.current = null
    }
  }, [])

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      audio.currentTime = 0
      setPlaying(false)
      return
    }

    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button
      type="button"
      className={`calm-ambience${playing ? ' is-playing' : ''}`}
      onClick={() => void toggle()}
      aria-pressed={playing}
      title={playing ? tx('ambiencePause') : tx('ambiencePlay')}
    >
      <span aria-hidden="true">ॐ</span>
      <em>{playing ? tx('ambiencePause') : tx('ambiencePlay')}</em>
    </button>
  )
}
