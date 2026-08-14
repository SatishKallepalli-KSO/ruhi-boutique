import { useEffect, useRef, useState } from 'react'
import type { DictKey } from '../content'

type Props = {
  tx: (key: DictKey) => string
}

/**
 * Optional calm ambience — user starts it (no autoplay).
 * Soft original temple-bell tones via Web Audio (not a copyrighted recording).
 */
export function CalmAmbience({ tx }: Props) {
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    return () => {
      nodesRef.current?.stop()
      void ctxRef.current?.close()
      ctxRef.current = null
      nodesRef.current = null
    }
  }, [])

  async function toggle() {
    if (playing) {
      nodesRef.current?.stop()
      nodesRef.current = null
      setPlaying(false)
      return
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx
    if (ctx.state === 'suspended') await ctx.resume()

    const master = ctx.createGain()
    master.gain.value = 0.045
    master.connect(ctx.destination)

    const timers: number[] = []
    let alive = true

    function chime(at: number, freq: number, dur = 3.8) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = 'sine'
      osc.frequency.value = freq
      filter.type = 'lowpass'
      filter.frequency.value = 1800
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      osc.start(at)
      osc.stop(at + dur + 0.05)
    }

    function scheduleLoop() {
      if (!alive) return
      const now = ctx.currentTime
      chime(now + 0.05, 392)
      chime(now + 0.18, 523.25)
      chime(now + 2.4, 349.23)
      chime(now + 4.8, 440)
      timers.push(window.setTimeout(scheduleLoop, 9200))
    }

    scheduleLoop()
    nodesRef.current = {
      stop: () => {
        alive = false
        for (const id of timers) window.clearTimeout(id)
        master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)
      },
    }
    setPlaying(true)
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
