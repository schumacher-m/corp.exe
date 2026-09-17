#!/usr/bin/env python3
"""
corp.exe original audio pack generator
PS1 / Win95 cubicle-farm aesthetic — all synthesized, no samples.
Regen: python3 audio/generate_audio.py
"""
from __future__ import annotations

import math
import os
import struct
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from scipy import signal as sps

OUT = Path(__file__).resolve().parent
SR = 44100  # master rate
TMP = OUT / "_tmp"
RNG = np.random.default_rng(19950701)  # deterministic "corp" seed


# ---------------------------------------------------------------------------
# Core DSP helpers
# ---------------------------------------------------------------------------

def clamp(x, lo=-1.0, hi=1.0):
    return np.clip(x, lo, hi)


def fade_edges(x, fade_ms=20, sr=SR):
    n = int(sr * fade_ms / 1000)
    if n <= 0 or len(x) < 2 * n:
        return x
    y = x.copy()
    ramp = np.linspace(0, 1, n)
    y[:n] *= ramp
    y[-n:] *= ramp[::-1]
    return y


def normalize(x, peak_db=-2.0):
    peak = np.max(np.abs(x)) + 1e-12
    target = 10 ** (peak_db / 20)
    return clamp(x * (target / peak))


def soft_limit(x, drive=1.2):
    return np.tanh(x * drive) / np.tanh(drive)


def bitcrush(x, bits=10, rate_div=1):
    """Quantize amplitude and optionally hold samples (PS1 crunch)."""
    y = np.asarray(x, dtype=np.float64)
    if rate_div > 1:
        n = len(y)
        idx = (np.arange(n) // rate_div) * rate_div
        idx = np.minimum(idx, n - 1)
        y = y[idx]
    levels = float(2 ** (bits - 1))
    return np.round(y * levels) / levels


def downsample_upsample(x, factor=4, sr=SR):
    """Cheap aliasing / PS1 feel: decimate then nearest upsample."""
    if factor <= 1:
        return x
    dec = x[::factor]
    # nearest-neighbor upsample
    return np.repeat(dec, factor)[: len(x)]


def one_pole_lp(x, cutoff, sr=SR):
    """Simple one-pole lowpass (scipy lfilter)."""
    cutoff = min(float(cutoff), sr * 0.49)
    rc = 1.0 / (2 * math.pi * cutoff)
    dt = 1.0 / sr
    a_coef = dt / (rc + dt)
    b = [a_coef]
    a = [1.0, a_coef - 1.0]
    return sps.lfilter(b, a, x).astype(np.float64)


def one_pole_hp(x, cutoff, sr=SR):
    cutoff = min(float(cutoff), sr * 0.49)
    rc = 1.0 / (2 * math.pi * cutoff)
    dt = 1.0 / sr
    a_coef = rc / (rc + dt)
    b = [a_coef, -a_coef]
    a = [1.0, a_coef - 1.0]
    return sps.lfilter(b, a, x).astype(np.float64)


def bandpass(x, low, high, sr=SR):
    return one_pole_lp(one_pole_hp(x, low, sr), high, sr)


def noise(n, color="white"):
    w = RNG.standard_normal(n).astype(np.float64)
    if color == "white":
        return w
    if color == "pink":
        # crude pink via rolling average
        k = 32
        kernel = np.ones(k) / k
        return np.convolve(w, kernel, mode="same")
    if color == "brown":
        y = np.cumsum(w)
        y -= np.mean(y)
        y /= np.max(np.abs(y)) + 1e-12
        return y
    return w


def sine(freq, n, sr=SR, phase=0.0):
    t = np.arange(n) / sr
    return np.sin(2 * math.pi * freq * t + phase)


def square(freq, n, sr=SR, duty=0.5):
    t = np.arange(n) / sr
    return np.where((t * freq) % 1.0 < duty, 1.0, -1.0).astype(np.float64)


def saw(freq, n, sr=SR):
    t = np.arange(n) / sr
    return 2.0 * ((t * freq) % 1.0) - 1.0


def triangle(freq, n, sr=SR):
    return 2.0 * np.abs(saw(freq, n, sr)) - 1.0


def env_adsr(n, a=0.01, d=0.05, s=0.6, r=0.1, sr=SR):
    a_n = max(1, int(a * sr))
    d_n = max(1, int(d * sr))
    r_n = max(1, int(r * sr))
    s_n = max(0, n - a_n - d_n - r_n)
    parts = []
    parts.append(np.linspace(0, 1, a_n))
    parts.append(np.linspace(1, s, d_n))
    if s_n:
        parts.append(np.full(s_n, s))
    parts.append(np.linspace(s, 0, r_n))
    e = np.concatenate(parts)
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]


def write_wav(path: Path, mono: np.ndarray, sr=SR):
    mono = clamp(mono)
    pcm = (mono * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def wav_to_ogg(wav_path: Path, ogg_path: Path, bitrate="96k"):
    subprocess.run(
        [
            "/usr/bin/ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(wav_path),
            "-c:a",
            "libvorbis",
            "-b:a",
            bitrate,
            str(ogg_path),
        ],
        check=True,
    )


def make_loopable(x, fade_ms=80, sr=SR):
    """Crossfade tail into head so HTMLAudio loop (last→first) has no click."""
    n = int(sr * fade_ms / 1000)
    if n < 2 or len(x) < 2 * n:
        return fade_edges(x, 5, sr)
    y = x.copy()
    # equal-power crossfade: only rewrite the TAIL so y[-1] ≈ y[0] when
    # head/tail already share musical phase (motif-aligned beds).
    fade_out = np.sqrt(np.linspace(1, 0, n))
    fade_in = np.sqrt(np.linspace(0, 1, n))
    y[-n:] = y[-n:] * fade_out + y[:n] * fade_in
    # force exact endpoint match (removes single-sample tick after encode)
    y[-1] = y[0]
    if n > 2:
        y[-2] = 0.5 * y[-2] + 0.5 * y[1]
    return y


# ---------------------------------------------------------------------------
# Atmospheric building blocks
# ---------------------------------------------------------------------------

def hvac_drone(n, sr=SR):
    """60Hz-ish fluorescent / HVAC rumble with slow beat."""
    base = (
        0.35 * sine(58.5, n, sr)
        + 0.22 * sine(117.0, n, sr, phase=0.4)
        + 0.12 * sine(176.0, n, sr, phase=1.1)
        + 0.08 * sine(41.0, n, sr)
    )
    # slow amplitude wander
    lfo = 0.85 + 0.15 * sine(0.07, n, sr)
    hum = 0.06 * sine(120.0, n, sr) * (0.5 + 0.5 * sine(0.11, n, sr))
    air = one_pole_lp(noise(n, "brown"), 180, sr) * 0.08
    return (base * lfo + hum + air) * 0.55


def fluorescent_hum(n, sr=SR):
    """Buzzing ballast feel — slightly detuned 120Hz stack."""
    buzz = (
        0.4 * square(119.3, n, sr, duty=0.48)
        + 0.25 * square(120.7, n, sr, duty=0.52)
        + 0.15 * sine(240.0, n, sr)
    )
    buzz = one_pole_lp(buzz, 900, sr)
    flicker = 0.9 + 0.1 * sine(0.23, n, sr) + 0.05 * sine(2.1, n, sr)
    return buzz * flicker * 0.12



def _loop_lfo(cycles, n, sr=SR, phase=0.0):
    """LFO that completes an integer number of cycles over n samples (seamless)."""
    t = np.arange(n) / sr
    dur = n / sr
    freq = cycles / dur
    return np.sin(2 * math.pi * freq * t + phase)


def hvac_drone_loop(n, sr=SR):
    """HVAC / fluorescent rumble with LFOs phase-locked to buffer length."""
    base = (
        0.35 * sine(58.5, n, sr)
        + 0.22 * sine(117.0, n, sr, phase=0.4)
        + 0.12 * sine(176.0, n, sr, phase=1.1)
        + 0.08 * sine(41.0, n, sr)
    )
    lfo = 0.85 + 0.15 * _loop_lfo(4, n, sr)          # 4 slow breaths per loop
    hum = 0.06 * sine(120.0, n, sr) * (0.5 + 0.5 * _loop_lfo(6, n, sr, phase=0.3))
    air = one_pole_lp(noise(n, "brown"), 180, sr) * 0.08
    # soften air at edges so noise isn't a seam tell
    air = make_loopable(air, fade_ms=200, sr=sr)
    return (base * lfo + hum + air) * 0.55


def fluorescent_hum_loop(n, sr=SR):
    """Ballast buzz with flicker LFO locked to loop length."""
    buzz = (
        0.4 * square(119.3, n, sr, duty=0.48)
        + 0.25 * square(120.7, n, sr, duty=0.52)
        + 0.15 * sine(240.0, n, sr)
    )
    buzz = one_pole_lp(buzz, 900, sr)
    flicker = 0.9 + 0.1 * _loop_lfo(8, n, sr) + 0.05 * _loop_lfo(32, n, sr, phase=1.0)
    return buzz * flicker * 0.12


def printer_chatter(n, sr=SR):
    """Sparse distant mechanical chatter bursts."""
    out = np.zeros(n)
    t = 0
    while t < n:
        gap = int(RNG.uniform(1.8, 5.5) * sr)
        burst_len = int(RNG.uniform(0.08, 0.35) * sr)
        if t + burst_len >= n:
            break
        # stepper-ish clicks
        click = np.zeros(burst_len)
        step = int(sr / RNG.uniform(18, 40))
        for i in range(0, burst_len, step):
            w = min(80, burst_len - i)
            click[i : i + w] += env_adsr(w, 0.001, 0.005, 0.2, 0.02, sr) * (
                0.4 * noise(w) + 0.3 * square(RNG.uniform(900, 1800), w, sr)
            )
        click = one_pole_lp(click, 2500, sr) * RNG.uniform(0.04, 0.09)
        # slap far-left stereo feel via filtering (mono: just dull)
        click = one_pole_lp(click, 1400, sr)
        out[t : t + burst_len] += click
        t += gap + burst_len
    return out


def sparse_lonely_notes(n, sr=SR):
    """Sparse detuned chiptune notes drifting in empty office."""
    # minor, slightly wrong scale
    freqs = [110.0, 130.81, 146.83, 164.81, 196.0, 207.65]  # A min-ish + wrong note
    out = np.zeros(n)
    t = int(0.8 * sr)
    while t < n - int(1.2 * sr):
        f = float(RNG.choice(freqs)) * (2 ** RNG.integers(0, 2))
        # detune a little
        f *= RNG.uniform(0.988, 1.012)
        dur = int(RNG.uniform(0.6, 1.8) * sr)
        dur = min(dur, n - t)
        tone = 0.55 * triangle(f, dur, sr) + 0.25 * sine(f * 2.01, dur, sr)
        tone = bitcrush(tone, bits=9, rate_div=2)
        e = env_adsr(dur, 0.05, 0.2, 0.35, 0.5, sr)
        out[t : t + dur] += tone * e * RNG.uniform(0.06, 0.12)
        t += int(RNG.uniform(2.5, 6.0) * sr)
    return one_pole_lp(out, 3200, sr)


def note_hz(midi):
    """MIDI note number → Hz (A4=440)."""
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))


def tracker_note(freq, n, sr=SR, kind="square", duty=0.4, crush_bits=10, rate_div=3):
    """Cheap PS1/tracker voice: square/triangle/saw + bitcrush."""
    if n <= 0:
        return np.zeros(0)
    if kind == "square":
        raw = 0.55 * square(freq, n, sr, duty=duty) + 0.25 * triangle(freq * 0.5, n, sr)
    elif kind == "triangle":
        raw = 0.65 * triangle(freq, n, sr) + 0.2 * sine(freq * 2.002, n, sr)
    elif kind == "saw":
        raw = 0.45 * saw(freq, n, sr) + 0.25 * square(freq * 0.997, n, sr, duty=0.35)
    else:
        raw = sine(freq, n, sr)
    raw = bitcrush(downsample_upsample(raw, max(1, rate_div)), bits=crush_bits)
    return raw


def place(buf, start, sig, gain=1.0):
    """Add sig into buf at start, clipped to buffer length."""
    if start >= len(buf) or len(sig) == 0:
        return
    end = min(len(buf), start + len(sig))
    buf[start:end] += sig[: end - start] * gain


def printer_tick(n, sr=SR, bright=1.0):
    """Single printer-ish mechanical click (short)."""
    click = one_pole_hp(noise(n), 3500, sr) * env_adsr(n, 0.0004, 0.008, 0.12, 0.025, sr)
    click += square(RNG.uniform(1100, 1700), n, sr, duty=0.3) * env_adsr(
        n, 0.0003, 0.006, 0.1, 0.02, sr
    ) * 0.25
    return one_pole_lp(click, 4500, sr) * 0.045 * bright


def grind_loop_motif(n, sr=SR, bpm=90.0, density=1.0, tense=False):
    """
    Multi-bar depressing tracker ostinato (shared palette A-minor-ish + wrong notes).
    density < 1 sparsifies (walk); tense=True speeds feel / adds dissonance (PR).
    Motif is exactly 8 bars of 4/4; caller should size n to an integer number of motifs.
    """
    beat_n = int(round(sr * 60.0 / bpm))
    bar_n = beat_n * 4
    motif_n = bar_n * 8  # 32 beats
    out = np.zeros(n)

    # Shared key center: A minor with a "wrong" B-natural / flat-fifth color
    # MIDI: A2=45, C3=48, E3=52, G3=55, Bb3=58, B3=59, C4=60, D4=62, E4=64
    ostinato = [
        # bar 0: hypnotic 4-note grind — last note is the wrong B
        [55, 58, 60, 59],
        # bar 1: same, slightly delayed last tick handled in timing
        [55, 58, 60, 59],
        # bar 2: drop then climb
        [52, 55, 58, 57],  # E G Bb A(wrong landing flat)
        [52, 55, 58, 57],
        # bar 4–5: thinner mid register echo
        [60, 58, 55, 58],
        [60, 58, 55, 59],  # ends on wrong B again
        # bar 6–7: sparse hold / ghost
        [55, None, 58, None],
        [52, None, 55, 59],
    ]
    if tense:
        # busier / more dissonant intervals (tritone hops)
        ostinato = [
            [55, 61, 60, 59],  # G C# C B — sick
            [55, 61, 60, 59],
            [52, 58, 61, 57],
            [52, 58, 61, 57],
            [60, 61, 55, 58],
            [60, 61, 55, 59],
            [55, 58, 61, None],
            [52, 61, 55, 59],
        ]

    # Bass root pattern (every 2–4 beats), octave below
    bass_pat = [33, None, 33, None, 31, None, 33, None]  # A2 / G2 pulse over 8 beats, tiled
    if tense:
        bass_pat = [33, 33, 31, 33, 33, 36, 31, 33]  # busier

    # Swing: slightly late off-beats (tracker humanize / sick feel)
    swing = 0.07 if not tense else 0.04  # fraction of beat

    num_motifs = max(1, int(np.ceil(n / motif_n)))
    for m in range(num_motifs):
        base = m * motif_n
        if base >= n:
            break
        # every other motif: micro-detune the whole pass (sick fluorescent pitch)
        motif_detune = 1.0 + (0.006 if (m % 2 == 1) else 0.0)
        if tense:
            motif_detune *= 1.0 + 0.003 * ((m % 3) - 1)

        for bar_i, notes in enumerate(ostinato):
            for beat_i, midi in enumerate(notes):
                # density: skip some notes for walk
                if density < 1.0 and midi is not None:
                    # keep downbeats and the wrong-note landings more often
                    keep = (beat_i == 0) or (beat_i == 3) or (RNG.random() < density)
                    if not keep:
                        midi = None

                beat_start = base + bar_i * bar_n + beat_i * beat_n
                # off-kilter: push beats 1 and 3 a tick late
                if beat_i in (1, 3):
                    beat_start += int(beat_n * swing)
                # every 8th bar cycle, delay the last note one extra tick
                if bar_i == 7 and beat_i == 3:
                    beat_start += int(beat_n * 0.12)

                if midi is not None and beat_start < n:
                    f = note_hz(midi) * motif_detune * RNG.uniform(0.998, 1.002)
                    dur = int(beat_n * (0.72 if not tense else 0.55))
                    if tense and beat_i % 2 == 0:
                        dur = int(beat_n * 0.42)  # choppier
                    kind = "square" if not tense else ("saw" if beat_i % 2 == 0 else "square")
                    duty = 0.38 if not tense else 0.32
                    wave_ = tracker_note(
                        f, dur, sr, kind=kind, duty=duty,
                        crush_bits=9 if tense else 10,
                        rate_div=2 if tense else 3,
                    )
                    e = env_adsr(dur, 0.004, 0.07, 0.38, 0.14, sr)
                    gain = 0.155 if not tense else 0.17
                    if density < 0.7:
                        gain *= 0.85
                    place(out, beat_start, wave_ * e, gain)

                # bass pulse on pattern
                bp = bass_pat[(bar_i * 4 + beat_i) % len(bass_pat)]
                if bp is not None and beat_start < n:
                    # only every 2 beats when not tense, unless density low
                    if tense or (beat_i % 2 == 0):
                        bf = note_hz(bp) * motif_detune
                        bdur = int(beat_n * (1.6 if not tense else 1.1))
                        bass = soft_limit(
                            sine(bf, bdur, sr) * env_adsr(bdur, 0.01, 0.12, 0.45, 0.25, sr)
                        )
                        # add quiet sub triangle for body
                        bass += triangle(bf * 0.5, bdur, sr) * env_adsr(
                            bdur, 0.02, 0.15, 0.35, 0.3, sr
                        ) * 0.35
                        place(out, beat_start, bass, 0.22 if not tense else 0.26)

                # sparse high printer tick every bar (beat 0) or every 2 bars
                tick_every = 1 if tense else 2
                if beat_i == 0 and (bar_i % tick_every == 0) and beat_start < n:
                    tn = min(int(0.04 * sr), beat_n // 4)
                    place(out, beat_start + int(0.02 * sr), printer_tick(tn, sr, bright=1.1 if tense else 0.85), 1.0)
                # ghost open-hat tick on offbeats (very quiet)
                if beat_i == 2 and density > 0.5 and beat_start < n:
                    tn = min(350, beat_n // 8)
                    hat = one_pole_hp(noise(tn), 5000, sr) * env_adsr(
                        tn, 0.0005, 0.008, 0.08, 0.02, sr
                    )
                    place(out, beat_start, hat, 0.028 if not tense else 0.04)

        # pad chord under each motif (slightly flat fifth — sick)
        pad_len = min(motif_n, n - base)
        if pad_len > 0:
            pad = (
                0.07 * sine(note_hz(33) * motif_detune, pad_len, sr)  # A1
                + 0.05 * sine(note_hz(36) * 0.995 * motif_detune, pad_len, sr)  # flat C
                + 0.04 * sine(note_hz(40) * 0.992 * motif_detune, pad_len, sr)  # flat E / sick
            )
            if tense:
                pad += 0.035 * sine(note_hz(39) * motif_detune, pad_len, sr)  # Eb — dissonant
            pad *= 0.75 + 0.25 * sine(0.045, pad_len, sr)
            pad = bitcrush(pad, bits=11)
            place(out, base, pad, 0.55 if not tense else 0.65)

    return one_pole_lp(out, 5200 if not tense else 5600, sr)


def sparse_lonely_notes(n, sr=SR, bpm=90.0):
    """Sparse detuned chiptune notes — same A-minor palette as the grind, lots of air."""
    beat_n = int(round(sr * 60.0 / bpm))
    # same scale as grind: A C E G Bb + wrong B
    pool = [45, 48, 52, 55, 58, 59, 60, 64]  # A2…E4
    out = np.zeros(n)
    # place notes on a slow grid so loop math stays clean: every 4–8 beats
    t = beat_n * 4  # start after one bar of air
    step_beats = 6
    i = 0
    while t < n - beat_n * 2:
        midi = pool[i % len(pool)]
        # occasionally the wrong B
        if i % 5 == 4:
            midi = 59
        f = note_hz(midi) * RNG.uniform(0.990, 1.008)
        # sometimes drop an octave for loneliness
        if i % 3 == 0:
            f *= 0.5
        dur = int(RNG.uniform(0.9, 2.2) * sr)
        dur = min(dur, n - t)
        tone = tracker_note(f, dur, sr, kind="triangle", crush_bits=9, rate_div=2)
        e = env_adsr(dur, 0.08, 0.25, 0.3, 0.6, sr)
        place(out, t, tone * e, RNG.uniform(0.07, 0.11))
        # rare soft echo an octave up, delayed
        if i % 4 == 2:
            echo_at = t + int(0.35 * sr)
            ed = int(0.5 * sr)
            if echo_at + ed < n:
                echo = tracker_note(f * 2.01, ed, sr, kind="triangle", crush_bits=11, rate_div=1)
        i += 1
        # advance 4, 6, or 8 beats — always on grid
        step_beats = [4, 6, 8, 6, 8, 4][i % 6]
        t += beat_n * step_beats
    return one_pole_lp(out, 3000, sr)


def distant_printer_bed(n, sr=SR, bpm=90.0):
    """Loop-friendly distant printer chatter aligned to bar grid (not free RNG bursts only)."""
    beat_n = int(round(sr * 60.0 / bpm))
    bar_n = beat_n * 4
    out = np.zeros(n)
    # also sprinkle classic freeform chatter underneath (quieter)
    out += printer_chatter(n) * 0.55
    # bar-aligned soft bursts so loop seam stays stable
    for bar in range(0, n // bar_n):
        if bar % 3 != 0:
            continue
        start = bar * bar_n + int(beat_n * 1.5)
        burst_len = int(RNG.uniform(0.12, 0.28) * sr)
        if start + burst_len >= n:
            break
        click = np.zeros(burst_len)
        step = max(1, int(sr / RNG.uniform(22, 36)))
        for i in range(0, burst_len, step):
            w = min(60, burst_len - i)
            click[i : i + w] += env_adsr(w, 0.001, 0.004, 0.15, 0.015, sr) * (
                0.35 * noise(w) + 0.25 * square(RNG.uniform(1000, 1600), w, sr)
            )
        click = one_pole_lp(click, 1600, sr) * RNG.uniform(0.03, 0.06)
        place(out, start, click, 1.0)
    return out


def tense_tracker_motif(n, sr=SR, bpm=112.5):
    """PR fight — same palette, faster / dissonant, still cheap tracker."""
    return grind_loop_motif(n, sr=sr, bpm=bpm, density=1.0, tense=True)


# ---------------------------------------------------------------------------
# BGM generators
# ---------------------------------------------------------------------------

# Shared tempo / loop math:
#   seated + walk use 90.0 BPM → beat = 29400 samples @ 44.1k
#   motif = 8 bars = 32 beats = 940800 samples ≈ 21.333s
#   durations chosen as integer motif counts for seamless loop period.

def _bgm_length(bpm, num_motifs, bars_per_motif=8, sr=SR):
    beat_n = int(round(sr * 60.0 / bpm))
    motif_n = beat_n * 4 * bars_per_motif
    return motif_n * num_motifs, beat_n, motif_n


def gen_bgm_cubicle_walk():
    """Lonely walk — same key as desktop, sparse notes, distant printers, HVAC."""
    bpm = 90.0
    # 4 motifs = ~85.33s (within 60–90)
    n, beat_n, motif_n = _bgm_length(bpm, num_motifs=4)
    mix = (
        hvac_drone_loop(n) * 0.95
        + fluorescent_hum_loop(n) * 1.05
        + distant_printer_bed(n, bpm=bpm) * 1.05
        + sparse_lonely_notes(n, bpm=bpm) * 1.05
        + grind_loop_motif(n, bpm=bpm, density=0.28, tense=False) * 0.35  # ghost of the grind
    )
    # very quiet CRT coil bed
    whine = sine(15600, n) * 0.0035 * (0.5 + 0.5 * sine(0.035, n))
    mix = mix + whine
    mix = soft_limit(mix * 0.9, drive=1.15)
    mix = make_loopable(mix, fade_ms=300)
    # quieter bed so footsteps/UI cut through
    return normalize(mix, peak_db=-11.0)


def gen_bgm_seated_desktop():
    """PRIORITY — the grind. Memorable detuned ostinato, HVAC, bass, printer ticks."""
    bpm = 90.0
    # 3 motifs = 64.0s exactly at 90 BPM / 44.1k
    n, beat_n, motif_n = _bgm_length(bpm, num_motifs=3)
    mix = (
        hvac_drone_loop(n) * 0.45
        + fluorescent_hum_loop(n) * 0.55
        + grind_loop_motif(n, bpm=bpm, density=1.0, tense=False) * 1.15
    )
    # rare distant hollow ping (dread mail somewhere else in the farm)
    for k in range(3):
        # park pings on motif boundaries so loop energy stays even
        at = (k + 1) * motif_n // 2 + int(2.5 * SR)
        if at + int(0.4 * SR) >= n:
            continue
        pn = int(0.38 * SR)
        mix[at : at + pn] += hollow_chord(pn) * 0.035
    mix = soft_limit(mix, drive=1.15)
    mix = make_loopable(mix, fade_ms=180)
    return normalize(mix, peak_db=-10.5)


def gen_bgm_pr_fight():
    """PR fight — same palette, 112.5 BPM, dissonant / busier, still MOD-cheap."""
    bpm = 112.5
    # beat = 23520 samples; motif 8 bars = 752640; 5 motifs = 85.333s
    n, beat_n, motif_n = _bgm_length(bpm, num_motifs=5)
    mix = (
        hvac_drone_loop(n) * 0.32
        + fluorescent_hum_loop(n) * 0.38
        + tense_tracker_motif(n, bpm=bpm) * 1.0
    )
    # occasional alarm-ish blip on motif downbeats (deterministic, loop-safe)
    bl = int(0.055 * SR)
    for m in range(5):
        if m % 2 == 0:
            continue
        at = m * motif_n + beat_n * 8  # mid-motif
        if at + bl > n:
            continue
        blip = square(830 * (1.0 + 0.02 * (m % 3)), bl, SR) * env_adsr(
            bl, 0.001, 0.01, 0.18, 0.025, SR
        )
        mix[at : at + bl] += blip * 0.04
    mix = soft_limit(mix, drive=1.2)
    mix = make_loopable(mix, fade_ms=160)
    return normalize(mix, peak_db=-10.0)


# ---------------------------------------------------------------------------
# SFX generators
# ---------------------------------------------------------------------------

def hollow_chord(n, sr=SR):
    """Muted wrong Slack-ish chord — dread not delight."""
    # minor second / hollow
    freqs = [523.25, 554.37, 392.0]  # C5, C#5 (wrong), G4
    out = np.zeros(n)
    for f, amp in zip(freqs, [0.45, 0.35, 0.25]):
        out += amp * sine(f * 0.997, n, sr)
        out += amp * 0.3 * triangle(f * 0.5, n, sr)
    out = bitcrush(out, bits=10)
    e = env_adsr(n, 0.002, 0.08, 0.25, 0.2, sr)
    # slight pitch dip
    return out * e


def sfx_footstep(variant=0):
    n = int(0.18 * SR)
    # soft carpet thud: noise burst + low bump
    body = one_pole_lp(noise(n, "brown"), 280, SR) * env_adsr(n, 0.002, 0.03, 0.3, 0.08, SR)
    bump_n = int(0.06 * SR)
    f0 = [85, 78, 92][variant]
    bump_sig = sine(f0, bump_n) * env_adsr(bump_n, 0.001, 0.02, 0.3, 0.03, SR)
    bump = np.zeros(n)
    bump[:bump_n] = bump_sig
    # carpet scuff
    scuff = one_pole_hp(noise(n), 800, SR) * env_adsr(n, 0.005, 0.04, 0.2, 0.06, SR) * 0.25
    # variant timing / filter
    mix = body * (0.55 + 0.1 * variant) + bump * 0.5 + scuff * (0.7 + 0.15 * variant)
    if variant == 1:
        mix = one_pole_lp(mix, 1200, SR)
    elif variant == 2:
        mix = mix * 0.9 + one_pole_lp(noise(n), 400, SR) * env_adsr(n, 0.001, 0.02, 0.2, 0.05, SR) * 0.15
    mix = fade_edges(mix, 5)
    return normalize(mix, peak_db=-3.0)


def sfx_chair_sit():
    # sit thump + wood creak
    n = int(0.55 * SR)
    thump_n = int(0.12 * SR)
    thump = one_pole_lp(noise(thump_n, "brown"), 200, SR) * env_adsr(thump_n, 0.002, 0.04, 0.35, 0.06, SR)
    thump += sine(70, thump_n) * env_adsr(thump_n, 0.001, 0.05, 0.3, 0.05, SR) * 0.6
    out = np.zeros(n)
    out[:thump_n] += thump * 0.8
    # creak: sweeping mid tone + noise
    creak_start = int(0.08 * SR)
    creak_n = int(0.4 * SR)
    t = np.arange(creak_n) / SR
    creak_f = 180 + 90 * t + 40 * np.sin(2 * math.pi * 6 * t)
    phase = 2 * np.pi * np.cumsum(creak_f) / SR
    creak = np.sin(phase) * 0.35 + one_pole_bp_noise(creak_n, 400, 2000) * 0.25
    creak *= env_adsr(creak_n, 0.02, 0.1, 0.4, 0.2, SR)
    end = min(n, creak_start + creak_n)
    out[creak_start:end] += creak[: end - creak_start]
    out = fade_edges(soft_limit(out), 8)
    return normalize(out, peak_db=-2.5)


def one_pole_bp_noise(n, low, high, sr=SR):
    return bandpass(noise(n), low, high, sr)


def sfx_crt_power_on():
    n = int(0.85 * SR)
    out = np.zeros(n)
    # initial thump / relay
    th = int(0.08 * SR)
    out[:th] += one_pole_lp(noise(th), 150, SR) * env_adsr(th, 0.001, 0.02, 0.4, 0.04, SR) * 0.9
    out[:th] += sine(55, th) * env_adsr(th, 0.001, 0.03, 0.3, 0.03, SR) * 0.5
    # rising whine / degauss-ish sweep (keep moderate)
    rise_start = int(0.05 * SR)
    rise_n = int(0.55 * SR)
    t = np.arange(rise_n) / SR
    f = 200 + 2800 * (t / (rise_n / SR)) ** 1.4
    phase = 2 * np.pi * np.cumsum(f) / SR
    rise = np.sin(phase) * env_adsr(rise_n, 0.05, 0.15, 0.5, 0.25, SR) * 0.35
    rise += one_pole_hp(noise(rise_n), 3000, SR) * env_adsr(rise_n, 0.08, 0.2, 0.3, 0.2, SR) * 0.08
    end = min(n, rise_start + rise_n)
    out[rise_start:end] += rise[: end - rise_start]
    # settle hum
    hum_start = int(0.45 * SR)
    hum = sine(15700, n - hum_start) * 0.02 * np.linspace(0, 1, n - hum_start)
    hum *= np.linspace(1, 0.3, n - hum_start)
    out[hum_start:] += hum
    out = fade_edges(out, 15)
    return normalize(soft_limit(out), peak_db=-2.0)


def sfx_crt_whine():
    """Short ~15kHz whine — SAFE: ≤1.5s, faded, modest level."""
    dur = 1.2
    n = int(dur * SR)
    # primary ~15.2 kHz + slight AM so it's hearable but not stabbing
    f = 15200.0
    tone = sine(f, n) * 0.22 + sine(f * 0.5, n) * 0.05  # subharmonic softener
    # gentle amplitude envelope — fade in/out, no strobe
    e = np.ones(n)
    fade = int(0.25 * SR)
    e[:fade] = np.linspace(0, 1, fade)
    e[-fade:] = np.linspace(1, 0, fade)
    # very slow AM (not flicker)
    am = 0.85 + 0.15 * sine(2.5, n)
    out = tone * e * am
    # slight bitcrush for authenticity but keep soft
    out = bitcrush(out, bits=12)
    return normalize(out, peak_db=-8.0)  # quieter on purpose — safety


def sfx_win95_click():
    n = int(0.045 * SR)
    # short soft square blip — original recreation, not MS sample
    click = square(1200, n, duty=0.4) * env_adsr(n, 0.0005, 0.008, 0.2, 0.02, SR)
    click += one_pole_hp(noise(n), 2000, SR) * env_adsr(n, 0.0005, 0.005, 0.1, 0.015, SR) * 0.3
    click = bitcrush(click, bits=8, rate_div=2)
    return normalize(fade_edges(click, 2), peak_db=-2.0)


def sfx_win95_error():
    # classic-ish descending two-tone ding (original)
    n = int(0.45 * SR)
    out = np.zeros(n)
    # tone 1
    d1 = int(0.18 * SR)
    out[:d1] += sine(880, d1) * env_adsr(d1, 0.005, 0.05, 0.4, 0.1, SR) * 0.55
    out[:d1] += sine(1760, d1) * env_adsr(d1, 0.005, 0.04, 0.3, 0.08, SR) * 0.15
    # tone 2 lower
    d2 = int(0.28 * SR)
    start = int(0.14 * SR)
    end = min(n, start + d2)
    seg = end - start
    out[start:end] += sine(659.25, seg) * env_adsr(seg, 0.005, 0.08, 0.4, 0.15, SR) * 0.6
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 5), peak_db=-2.0)


def sfx_win95_recycle():
    # crumple / paper-ish + soft descending blips (original bin metaphor)
    n = int(0.55 * SR)
    crumple = bandpass(noise(n), 800, 5000, SR) * env_adsr(n, 0.01, 0.15, 0.35, 0.25, SR)
    # modulate crumple
    crumple *= 0.6 + 0.4 * square(14, n, duty=0.5)
    out = crumple * 0.45
    # three descending soft tones
    for i, f in enumerate([740, 554, 415]):
        st = int((0.08 + i * 0.1) * SR)
        dn = int(0.12 * SR)
        if st + dn > n:
            break
        out[st : st + dn] += sine(f, dn) * env_adsr(dn, 0.005, 0.04, 0.3, 0.06, SR) * 0.35
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 8), peak_db=-2.5)


def sfx_win95_start():
    # ascending soft chord flourish — original, not MS startup
    n = int(0.55 * SR)
    out = np.zeros(n)
    notes = [261.63, 329.63, 392.0, 523.25]  # C E G C
    for i, f in enumerate(notes):
        st = int(i * 0.07 * SR)
        dn = int(0.35 * SR)
        if st + dn > n:
            dn = n - st
        tone = sine(f, dn) * 0.4 + triangle(f, dn) * 0.2
        tone *= env_adsr(dn, 0.01, 0.08, 0.45, 0.2, SR)
        out[st : st + dn] += tone * (0.5 + 0.1 * i)
    out = bitcrush(one_pole_lp(out, 6000, SR), bits=11)
    return normalize(fade_edges(out, 8), peak_db=-2.0)


def sfx_key(variant=0):
    n = int(0.055 * SR)
    f0 = [2100, 2400, 1850][variant]
    click = square(f0, n, duty=0.35) * env_adsr(n, 0.0004, 0.006, 0.15, 0.02, SR)
    click += one_pole_hp(noise(n), 3000, SR) * env_adsr(n, 0.0003, 0.004, 0.1, 0.015, SR) * 0.45
    # bottom-out thud
    thud_n = int(0.025 * SR)
    click[:thud_n] += sine([280, 320, 250][variant], thud_n) * env_adsr(thud_n, 0.0005, 0.008, 0.2, 0.01, SR) * 0.35
    click = bitcrush(click, bits=8, rate_div=1 + variant)
    return normalize(fade_edges(click, 1), peak_db=-2.5)


def sfx_mouse_click():
    n = int(0.05 * SR)
    click = one_pole_hp(noise(n), 1500, SR) * env_adsr(n, 0.0004, 0.005, 0.15, 0.02, SR)
    click += square(1600, n, duty=0.4) * env_adsr(n, 0.0004, 0.006, 0.2, 0.015, SR) * 0.4
    click = bitcrush(click, bits=9)
    return normalize(fade_edges(click, 1), peak_db=-2.5)


def sfx_slack_ping():
    n = int(0.42 * SR)
    out = hollow_chord(n) * 0.85
    # extra hollow reverb-ish tail via delayed quiet copy
    delay = int(0.09 * SR)
    delayed = np.zeros(n)
    delayed[delay:] = out[: n - delay] * 0.35
    out = one_pole_lp(out + delayed, 4500, SR)
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 10), peak_db=-4.0)


def sfx_ticket_complete():
    # unsatisfying: flat single blip then dying fall — anticlimactic
    n = int(0.5 * SR)
    out = np.zeros(n)
    d1 = int(0.12 * SR)
    out[:d1] += sine(440, d1) * env_adsr(d1, 0.005, 0.04, 0.4, 0.06, SR) * 0.45
    # expected fanfare... fails into flat tone
    d2 = int(0.28 * SR)
    st = int(0.1 * SR)
    t = np.arange(d2) / SR
    f = 523.25 * np.exp(-t * 1.8)  # sad droop
    phase = 2 * np.pi * np.cumsum(f) / SR
    limp = np.sin(phase) * env_adsr(d2, 0.01, 0.1, 0.3, 0.15, SR) * 0.35
    out[st : st + d2] += limp
    # tiny click of disappointment
    ck = int(0.02 * SR)
    out[st : st + ck] += noise(ck) * 0.08
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 8), peak_db=-3.0)


def sfx_sanity_low():
    # brief dissonant sting
    n = int(0.38 * SR)
    out = (
        sine(311.13, n) * 0.4  # Eb
        + sine(329.63, n) * 0.4  # E — minor second grind
        + sine(155.56, n) * 0.25
    )
    out += one_pole_hp(noise(n), 2000, SR) * env_adsr(n, 0.001, 0.05, 0.2, 0.15, SR) * 0.2
    out *= env_adsr(n, 0.002, 0.06, 0.35, 0.2, SR)
    out = bitcrush(soft_limit(out), bits=9)
    return normalize(fade_edges(out, 8), peak_db=-2.5)



def sfx_jimbo_chime():
    """Cheerful-wrong corporate AI chime — bright triad that lands flat."""
    n = int(0.55 * SR)
    out = np.zeros(n)
    notes = [523.25 * 0.985, 659.25 * 0.978, 783.99 * 0.97]
    t0 = 0
    for f in notes:
        d = int(0.14 * SR)
        env = env_adsr(d, 0.005, 0.04, 0.5, 0.08, SR)
        tone = sine(f, d) * 0.45 + triangle(f * 2, d) * 0.12
        out[t0 : t0 + d] += tone * env
        t0 += int(0.1 * SR)
    spark = int(0.2 * SR)
    st = int(0.32 * SR)
    out[st : st + spark] += (
        sine(1046.5 * 0.96, spark) * env_adsr(spark, 0.001, 0.05, 0.2, 0.1, SR) * 0.25
    )
    delay = int(0.07 * SR)
    delayed = np.zeros(n)
    delayed[delay:] = out[: n - delay] * 0.3
    out = one_pole_lp(out + delayed, 6000, SR)
    out = bitcrush(out, bits=10, rate_div=2)
    return normalize(fade_edges(out, 8), peak_db=-3.0)


def sfx_jimbo_fail():
    """Fail fanfare: fake victory then sad droop when Jimbo sabotages."""
    n = int(0.7 * SR)
    out = np.zeros(n)
    d1 = int(0.12 * SR)
    out[:d1] += (
        (sine(523.25, d1) + sine(659.25, d1) * 0.7)
        * env_adsr(d1, 0.005, 0.03, 0.5, 0.05, SR)
        * 0.4
    )
    d2 = int(0.45 * SR)
    st = int(0.1 * SR)
    t = np.arange(d2) / SR
    f = 392.0 * np.exp(-t * 2.2)
    phase = 2 * np.pi * np.cumsum(f) / SR
    limp = np.sin(phase) * env_adsr(d2, 0.01, 0.12, 0.35, 0.2, SR) * 0.5
    limp += sine(207.65, d2) * env_adsr(d2, 0.02, 0.1, 0.3, 0.2, SR) * 0.25
    out[st : st + d2] += limp
    ck = int(0.03 * SR)
    out[st : st + ck] += noise(ck) * 0.12
    out = bitcrush(soft_limit(out), bits=9)
    return normalize(fade_edges(out, 10), peak_db=-2.5)


def sfx_new_mail():
    """Outlook Express dread ding — descending hollow double-ping."""
    n = int(0.55 * SR)
    out = np.zeros(n)
    for f, start in [(880 * 0.85, 0.0), (659.25 * 0.8, 0.14)]:
        d = int(0.22 * SR)
        st = int(start * SR)
        tone = sine(f, d) * 0.55 + sine(f * 1.5, d) * 0.15
        tone *= env_adsr(d, 0.002, 0.06, 0.25, 0.12, SR)
        out[st : st + d] += tone
    out = one_pole_lp(out, 3500, SR)
    delay = int(0.08 * SR)
    delayed = np.zeros(n)
    delayed[delay:] = out[: n - delay] * 0.4
    out = out + delayed
    t = np.arange(n) / SR
    out *= 1.0 + 0.03 * np.sin(2 * np.pi * 6 * t)
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 8), peak_db=-3.5)


def sfx_away_tick():
    """Soft Away warning tick — quiet anxiety, not alarm."""
    n = int(0.18 * SR)
    click = one_pole_hp(noise(n), 2500, SR) * env_adsr(n, 0.001, 0.02, 0.15, 0.08, SR) * 0.35
    tone = sine(740, n) * env_adsr(n, 0.001, 0.03, 0.2, 0.1, SR) * 0.25
    out = one_pole_lp(click + tone, 5000, SR)
    out = bitcrush(out, bits=10, rate_div=2)
    return normalize(fade_edges(out, 3), peak_db=-8.0)



def sfx_jiggler_tick():
    """Quiet Presence Theater mouse-jiggle tick — softer than Away."""
    n = int(0.12 * SR)
    click = one_pole_hp(noise(n), 3000, SR) * env_adsr(n, 0.0005, 0.015, 0.1, 0.05, SR) * 0.22
    tone = sine(920, n) * env_adsr(n, 0.0005, 0.02, 0.12, 0.06, SR) * 0.12
    out = one_pole_lp(click + tone, 5500, SR)
    out = bitcrush(out, bits=10, rate_div=3)
    return normalize(fade_edges(out, 2), peak_db=-12.0)


def sfx_timesheet_save():
    """Timesheet Lock save beep — cheap Win95 confirm, slightly hollow."""
    n = int(0.35 * SR)
    out = np.zeros(n)
    for f, start in [(698.46, 0.0), (880.0 * 0.97, 0.08)]:
        d = int(0.14 * SR)
        st = int(start * SR)
        tone = sine(f, d) * 0.5 + triangle(f, d) * 0.1
        tone *= env_adsr(d, 0.002, 0.04, 0.3, 0.08, SR)
        out[st : st + d] += tone
    ck = int(0.025 * SR)
    st2 = int(0.2 * SR)
    out[st2 : st2 + ck] += one_pole_lp(noise(ck), 4000, SR) * 0.15
    out = one_pole_lp(out, 5000, SR)
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 6), peak_db=-4.0)



def sfx_teams_ring():
    """Corporate Teams parody ring — dual-tone, loopable ~2s."""
    period = 2.0
    n = int(period * SR)
    out = np.zeros(n)
    for start, dur in [(0.0, 0.38), (1.0, 0.38)]:
        d = int(dur * SR)
        st = int(start * SR)
        t = np.arange(d) / SR
        a = sine(440 * 1.02, d) * 0.35
        b = sine(523.25 * 0.98, d) * 0.32
        env = env_adsr(d, 0.01, 0.05, 0.7, 0.08, SR)
        wob = 1.0 + 0.08 * np.sin(2 * np.pi * 8 * t)
        out[st : st + d] += (a + b) * env * wob
    out = one_pole_lp(out, 4500, SR)
    out = bitcrush(out, bits=10, rate_div=2)
    out = make_loopable(out, fade_ms=40, sr=SR)
    return normalize(out, peak_db=-4.0)



# --- nonsense babble (Call Theater muffledCall) ---
_VOWELS = {
    "a": (800, 1200, 2500),
    "e": (500, 1800, 2500),
    "i": (300, 2200, 3000),
    "o": (500, 900, 2400),
    "u": (350, 700, 2200),
    "ae": (700, 1600, 2500),
    "uh": (600, 1000, 2400),
}


def _formant_resonator(exc, f, bw, sr=SR):
    r = math.exp(-math.pi * bw / sr)
    cosw = math.cos(2 * math.pi * f / sr)
    y = np.zeros_like(exc)
    a1 = 2 * r * cosw
    a2 = -(r * r)
    y1 = 0.0
    y2 = 0.0
    for n, x in enumerate(exc):
        yn = x + a1 * y1 + a2 * y2
        y[n] = yn
        y2, y1 = y1, yn
    return y


def _vowel_segment(f0, formants, n, sr=SR):
    t = np.arange(n) / sr
    f0_inst = f0 * (1.0 + 0.03 * np.sin(2 * math.pi * 3.5 * t))
    phase = 2 * math.pi * np.cumsum(f0_inst) / sr
    buzz = (2 * ((phase / (2 * math.pi)) % 1.0) - 1.0) * 0.35
    buzz += np.sin(phase) * 0.25
    buzz += RNG.normal(0, 0.02, n)
    out = np.zeros(n)
    for ff, g, bw in zip(formants, [1.0, 0.7, 0.35], [90, 110, 150]):
        out += _formant_resonator(buzz, ff, bw, sr) * g
    peak = np.max(np.abs(out)) + 1e-9
    return out / peak


def _babble_phrase(n_syllables, f0_base, sr=SR):
    chunks = []
    keys = list(_VOWELS.keys())
    for i in range(n_syllables):
        dur = float(RNG.uniform(0.08, 0.18))
        n = int(dur * sr)
        key = keys[int(RNG.integers(0, len(keys)))]
        f0 = f0_base * float(RNG.uniform(0.92, 1.12))
        if i == n_syllables - 1 and RNG.random() < 0.45:
            f0 *= 1.08
        seg = _vowel_segment(f0, _VOWELS[key], n, sr)
        env = env_adsr(n, 0.01, 0.03, 0.65, 0.04, sr)
        if RNG.random() < 0.55:
            puff_n = int(float(RNG.uniform(0.015, 0.04)) * sr)
            puff = one_pole_lp(noise(puff_n), 2500, sr)
            puff *= env_adsr(puff_n, 0.001, 0.01, 0.3, 0.015, sr) * 0.35
            chunks.append(puff)
        chunks.append(seg * env)
        chunks.append(np.zeros(int(float(RNG.uniform(0.02, 0.07)) * sr)))
    chunks.append(np.zeros(int(float(RNG.uniform(0.15, 0.45)) * sr)))
    return np.concatenate(chunks) if chunks else np.zeros(1)


def sfx_muffled_call():
    """Connected-call bed: nonsense babble — nonsense vowels, NO intelligible speech."""
    dur = 12.0
    n = int(dur * SR)
    bed = hvac_drone(n) * 0.12 + fluorescent_hum(n) * 0.06
    voices = []
    for f0_base, amp, pan_delay in [(145.0, 0.9, 0), (190.0, 0.35, int(0.04 * SR))]:
        buf = []
        filled = 0
        while filled < n + SR:
            phrase = _babble_phrase(int(RNG.integers(3, 9)), f0_base)
            buf.append(phrase)
            filled += len(phrase)
        v = np.concatenate(buf)
        if pan_delay:
            delayed = np.zeros(n)
            src = v[:n]
            delayed[pan_delay:] = src[: n - pan_delay]
            v = delayed
        else:
            v = v[:n]
        v = bandpass(v, 320, 3200, SR)
        v = bitcrush(v, bits=9, rate_div=2)
        voices.append(v * amp)
    voice = normalize(voices[0] + voices[1], peak_db=-6.0) * 0.7
    voice = one_pole_lp(voice, 3400, SR)
    out = bed + voice + one_pole_hp(noise(n), 7000, SR) * 0.015
    out = make_loopable(out, fade_ms=150, sr=SR)
    return normalize(out, peak_db=-7.5)



def sfx_call_accept():
    n = int(0.22 * SR)
    out = np.zeros(n)
    for f, start, amp in [(523.25, 0.0, 0.4), (659.25, 0.05, 0.35)]:
        d = int(0.12 * SR)
        st = int(start * SR)
        tone = sine(f, d) * amp * env_adsr(d, 0.002, 0.03, 0.35, 0.06, SR)
        out[st : st + d] += tone
    out = bitcrush(one_pole_lp(out, 5000, SR), bits=10)
    return normalize(fade_edges(out, 4), peak_db=-3.0)


def sfx_call_decline():
    n = int(0.28 * SR)
    out = np.zeros(n)
    for f, start, amp in [(440.0, 0.0, 0.4), (329.63, 0.07, 0.35)]:
        d = int(0.14 * SR)
        st = int(start * SR)
        tone = (sine(f, d) * amp + triangle(f, d) * 0.08) * env_adsr(d, 0.002, 0.04, 0.3, 0.08, SR)
        out[st : st + d] += tone
    out = bitcrush(one_pole_lp(out, 4500, SR), bits=10)
    return normalize(fade_edges(out, 5), peak_db=-3.0)


def sfx_teams_ping():
    """Teams chat ping — dread cousin of Slack ping."""
    n = int(0.4 * SR)
    out = hollow_chord(n) * 0.8
    d = int(0.15 * SR)
    out[:d] += sine(740, d) * env_adsr(d, 0.001, 0.04, 0.25, 0.08, SR) * 0.2
    delay = int(0.08 * SR)
    delayed = np.zeros(n)
    delayed[delay:] = out[: n - delay] * 0.32
    out = one_pole_lp(out + delayed, 4200, SR)
    out = bitcrush(out, bits=10)
    return normalize(fade_edges(out, 8), peak_db=-4.0)



def sfx_outlook_whoosh():
    """Soft Focused/Other tab whoosh — quiet UI breeze."""
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    nz = noise(n, color="pink")
    env = np.sin(np.pi * t / max(float(t[-1]), 1e-9)) ** 1.2
    hi = one_pole_hp(nz, 2000, SR)
    lo = one_pole_lp(hi, 4500, SR)
    out = lo * env * 0.55
    ck = int(0.012 * SR)
    out[:ck] += sine(1200, ck) * env_adsr(ck, 0.0005, 0.004, 0.2, 0.005, SR) * 0.08
    out = bitcrush(out, bits=11, rate_div=2)
    return normalize(fade_edges(out, 3), peak_db=-10.0)


# ---------------------------------------------------------------------------
# Tower arrival (CORP-TOWER-01) — plaza → lobby → elevator → floor
# ---------------------------------------------------------------------------

def amb_plaza():
    """Outdoor plaza bed — wind + distant HVAC, lonely approach to the tower."""
    dur = 28.0
    n = int(dur * SR)
    # wind: filtered pink/brown with integer-cycle LFOs for seamless loop
    wind = one_pole_lp(noise(n, "pink"), 900, SR) * 0.55
    wind += one_pole_lp(noise(n, "brown"), 220, SR) * 0.4
    wind *= 0.55 + 0.45 * _loop_lfo(3, n, sr=SR)
    wind *= 0.7 + 0.3 * _loop_lfo(7, n, sr=SR, phase=1.2)
    # distant tower HVAC bleed (quieter, duller than indoor)
    distant = hvac_drone_loop(n) * 0.22
    distant = one_pole_lp(distant, 280, SR)
    # occasional soft outdoor whoosh (synth gust, not traffic sample)
    gusts = np.zeros(n)
    for k in range(5):
        at = int((k + 0.5) * n / 5)
        gn = int(1.4 * SR)
        if at + gn > n:
            continue
        g = one_pole_bp_noise(gn, 200, 1400) * env_adsr(gn, 0.25, 0.4, 0.35, 0.5, SR)
        g *= 0.045 + 0.015 * (k % 2)
        gusts[at : at + gn] += g
    gusts = make_loopable(gusts, fade_ms=250)
    mix = wind * 0.55 + distant + gusts
    mix = bitcrush(downsample_upsample(mix, 3), bits=10)
    mix = soft_limit(mix * 0.95, drive=1.1)
    mix = make_loopable(mix, fade_ms=280)
    return normalize(mix, peak_db=-12.0)


def sfx_badge_beep():
    """Badge reader Accept — short cheap two-tone success beep."""
    n = int(0.2 * SR)
    out = np.zeros(n)
    for f, start, amp in [(1046.5, 0.0, 0.45), (1318.5, 0.045, 0.38)]:
        d = int(0.09 * SR)
        st = int(start * SR)
        tone = sine(f, d) * amp + square(f, d, duty=0.4) * 0.08
        tone *= env_adsr(d, 0.001, 0.02, 0.35, 0.04, SR)
        out[st : st + d] += tone
    # tiny relay click
    ck = int(0.012 * SR)
    out[:ck] += one_pole_lp(noise(ck), 5000, SR) * 0.18
    out = bitcrush(one_pole_lp(out, 6000, SR), bits=10)
    return normalize(fade_edges(out, 3), peak_db=-3.0)


def sfx_badge_deny():
    """Soft badge deny chirp — quiet fail then still-success path (never softlock)."""
    n = int(0.22 * SR)
    out = np.zeros(n)
    d = int(0.14 * SR)
    t = np.arange(d) / SR
    f = 620.0 * np.exp(-t * 4.5)
    phase = 2 * np.pi * np.cumsum(f) / SR
    chirp = np.sin(phase) * 0.45
    chirp += square(380, d, duty=0.35) * env_adsr(d, 0.001, 0.03, 0.2, 0.06, SR) * 0.08
    chirp *= env_adsr(d, 0.002, 0.04, 0.25, 0.08, SR)
    out[:d] += chirp
    # soft error tick
    ck = int(0.02 * SR)
    st = int(0.1 * SR)
    out[st : st + ck] += one_pole_lp(noise(ck), 3500, SR) * 0.12
    out = bitcrush(one_pole_lp(out, 4500, SR), bits=9)
    # quieter than success beep
    return normalize(fade_edges(out, 4), peak_db=-8.0)


def amb_lobby():
    """Indoor lobby bed — HVAC + fluorescent + distant nonsense murmur (no real words)."""
    dur = 32.0
    n = int(dur * SR)
    bed = hvac_drone_loop(n) * 0.7 + fluorescent_hum_loop(n) * 0.55
    # muffled lobby air / carpet hush
    air = one_pole_lp(noise(n, "pink"), 450, SR) * 0.06
    air *= 0.8 + 0.2 * _loop_lfo(5, n, sr=SR, phase=0.5)
    air = make_loopable(air, fade_ms=220)
    # distant nonsense babble — very low, band-limited (lobby murmur, not intelligible)
    murmur = np.zeros(n)
    for f0_base, amp in [(130.0, 0.55), (175.0, 0.35), (210.0, 0.22)]:
        buf = []
        filled = 0
        while filled < n + SR:
            # shorter quieter phrases with longer gaps
            phrase = _babble_phrase(int(RNG.integers(2, 6)), f0_base)
            gap = np.zeros(int(float(RNG.uniform(0.6, 2.2)) * SR))
            buf.append(phrase)
            buf.append(gap)
            filled += len(phrase) + len(gap)
        v = np.concatenate(buf)[:n]
        v = bandpass(v, 280, 2200, SR)
        v = one_pole_lp(v, 1800, SR)
        v = bitcrush(v, bits=8, rate_div=3)
        murmur += v * amp * 0.045
    murmur = make_loopable(murmur, fade_ms=200)
    # rare soft door whoosh / distant click (deterministic-ish via loop placement)
    extras = np.zeros(n)
    for at_frac, kind in [(0.22, "click"), (0.61, "whoosh"), (0.84, "click")]:
        at = int(at_frac * n)
        if kind == "click":
            cn = int(0.04 * SR)
            if at + cn < n:
                extras[at : at + cn] += one_pole_lp(noise(cn), 3000, SR) * env_adsr(
                    cn, 0.001, 0.01, 0.2, 0.02, SR
                ) * 0.06
        else:
            wn = int(0.35 * SR)
            if at + wn < n:
                w = one_pole_bp_noise(wn, 400, 2800) * env_adsr(wn, 0.05, 0.1, 0.3, 0.15, SR)
                extras[at : at + wn] += w * 0.04
    extras = make_loopable(extras, fade_ms=180)
    mix = bed + air + murmur + extras
    mix = soft_limit(mix * 0.95, drive=1.12)
    mix = make_loopable(mix, fade_ms=260)
    return normalize(mix, peak_db=-11.5)


def amb_elevator():
    """Elevator car hum — motor drone loop while riding (~12s)."""
    dur = 12.0
    n = int(dur * SR)
    # motor / cable fundamental stack
    motor = (
        0.4 * sine(62.0, n)
        + 0.28 * sine(124.0, n, phase=0.3)
        + 0.15 * sine(186.0, n, phase=1.0)
        + 0.1 * sine(48.0, n)
        + 0.08 * triangle(93.0, n)
    )
    wob = 0.88 + 0.12 * _loop_lfo(2, n, sr=SR)
    motor *= wob
    # mid buzz / gear whine
    whine = sine(410.0, n) * 0.04 * (0.6 + 0.4 * _loop_lfo(4, n, sr=SR, phase=0.7))
    whine += sine(820.0, n) * 0.015 * (0.5 + 0.5 * _loop_lfo(6, n, sr=SR))
    # cabin air
    air = one_pole_lp(noise(n, "brown"), 160, SR) * 0.1
    air = make_loopable(air, fade_ms=150)
    # tiny cable tick every ~3s (loop-locked)
    ticks = np.zeros(n)
    for k in range(4):
        at = int(k * n / 4) + int(0.15 * SR)
        tn = int(0.025 * SR)
        if at + tn >= n:
            continue
        ticks[at : at + tn] += one_pole_hp(noise(tn), 2000, SR) * env_adsr(
            tn, 0.0005, 0.005, 0.15, 0.012, SR
        ) * 0.05
    ticks = make_loopable(ticks, fade_ms=80)
    mix = motor * 0.55 + whine + air + ticks
    mix = bitcrush(one_pole_lp(mix, 3500, SR), bits=10, rate_div=2)
    mix = soft_limit(mix, drive=1.15)
    mix = make_loopable(mix, fade_ms=120)
    return normalize(mix, peak_db=-10.0)


def sfx_elevator_ding():
    """Elevator arrive ding — cheap two-tone chime."""
    n = int(0.55 * SR)
    out = np.zeros(n)
    for f, start, amp in [(784.0, 0.0, 0.5), (1046.5, 0.09, 0.42)]:
        d = int(0.35 * SR)
        st = int(start * SR)
        if st + d > n:
            d = n - st
        tone = sine(f, d) * amp + sine(f * 2.01, d) * 0.12 + triangle(f * 0.5, d) * 0.08
        tone *= env_adsr(d, 0.002, 0.08, 0.28, 0.22, SR)
        out[st : st + d] += tone
    # soft mechanical release
    ck = int(0.03 * SR)
    out[:ck] += one_pole_lp(noise(ck), 2500, SR) * 0.1
    out = bitcrush(one_pole_lp(out, 5500, SR), bits=10)
    return normalize(fade_edges(out, 6), peak_db=-3.5)


def amb_floor():
    """Open-plan floor fluorescent/HVAC bed — same A-minor palette as seated desktop BGM."""
    # ~32s: aligned enough for ~0.5–0.8s crossfade into bgm-seated-desktop
    dur = 32.0
    n = int(dur * SR)
    bed = hvac_drone_loop(n) * 0.75 + fluorescent_hum_loop(n) * 0.95
    # shared cubicle-hell pad (A C E G Bb) — sparse, low, matches seated key center
    pad_freqs = [110.0, 130.81, 164.81, 196.0, 233.08]  # A2 C3 E3 G3 Bb3
    pad = np.zeros(n)
    for i, f in enumerate(pad_freqs):
        amp = 0.045 - 0.005 * i
        tone = sine(f, n) * amp + triangle(f * 0.997, n) * (amp * 0.35)
        # slow breathe locked to loop
        tone *= 0.65 + 0.35 * _loop_lfo(2 + (i % 3), n, sr=SR, phase=i * 0.7)
        pad += tone
    pad = one_pole_lp(pad, 900, SR)
    pad = bitcrush(pad, bits=10, rate_div=2)
    # quiet CRT coil ghost (same family as walk BGM)
    whine = sine(15600, n) * 0.0025 * (0.5 + 0.5 * _loop_lfo(3, n, sr=SR))
    # soft distant printer whisper (very sparse) — same family as walk BGM
    printers = distant_printer_bed(n, bpm=90.0) * 0.35
    mix = bed + pad * 0.85 + whine + printers
    mix = soft_limit(mix * 0.92, drive=1.12)
    mix = make_loopable(mix, fade_ms=280)
    return normalize(mix, peak_db=-11.0)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    TMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    print("Generating BGM...")
    bgm_specs = [
        ("bgm-cubicle-walk.ogg", gen_bgm_cubicle_walk),
        ("bgm-seated-desktop.ogg", gen_bgm_seated_desktop),
        ("bgm-pr-fight.ogg", gen_bgm_pr_fight),
    ]
    for name, fn in bgm_specs:
        print(f"  {name}...")
        audio = fn()
        wav_path = TMP / (name.replace(".ogg", ".wav"))
        write_wav(wav_path, audio)
        wav_to_ogg(wav_path, OUT / name, bitrate="128k")
        print(f"    -> {(OUT / name).stat().st_size} bytes")

    print("Generating SFX...")
    sfx = [
        ("sfx-footstep-01.wav", lambda: sfx_footstep(0)),
        ("sfx-footstep-02.wav", lambda: sfx_footstep(1)),
        ("sfx-footstep-03.wav", lambda: sfx_footstep(2)),
        ("sfx-chair-sit.wav", sfx_chair_sit),
        ("sfx-crt-power-on.wav", sfx_crt_power_on),
        ("sfx-crt-whine.wav", sfx_crt_whine),
        ("sfx-win95-click.wav", sfx_win95_click),
        ("sfx-win95-error.wav", sfx_win95_error),
        ("sfx-win95-recycle.wav", sfx_win95_recycle),
        ("sfx-win95-start.wav", sfx_win95_start),
        ("sfx-key-01.wav", lambda: sfx_key(0)),
        ("sfx-key-02.wav", lambda: sfx_key(1)),
        ("sfx-key-03.wav", lambda: sfx_key(2)),
        ("sfx-mouse-click.wav", sfx_mouse_click),
        ("sfx-slack-ping.wav", sfx_slack_ping),
        ("sfx-ticket-complete.wav", sfx_ticket_complete),
        ("sfx-sanity-low.wav", sfx_sanity_low),
        ("sfx-jimbo-chime.wav", sfx_jimbo_chime),
        ("sfx-jimbo-fail.wav", sfx_jimbo_fail),
        ("sfx-new-mail.wav", sfx_new_mail),
        ("sfx-away-tick.wav", sfx_away_tick),
        ("sfx-jiggler-tick.wav", sfx_jiggler_tick),
        ("sfx-timesheet-save.wav", sfx_timesheet_save),
        ("sfx-teams-ring.wav", sfx_teams_ring),
        ("sfx-call-accept.wav", sfx_call_accept),
        ("sfx-call-decline.wav", sfx_call_decline),
        ("sfx-teams-ping.wav", sfx_teams_ping),
        ("sfx-outlook-whoosh.wav", sfx_outlook_whoosh),
    ]
    for name, fn in sfx:
        print(f"  {name}...")
        audio = fn()
        write_wav(OUT / name, audio)
        print(f"    -> {(OUT / name).stat().st_size} bytes")

    print("  sfx-muffled-call.ogg...")
    muffled = sfx_muffled_call()
    wav_path = TMP / "sfx-muffled-call.wav"
    write_wav(wav_path, muffled)
    wav_to_ogg(wav_path, OUT / "sfx-muffled-call.ogg", bitrate="80k")
    print(f"    -> {(OUT / 'sfx-muffled-call.ogg').stat().st_size} bytes")

    print("Generating Tower arrival (CORP-TOWER-01)...")
    tower_ogg = [
        ("amb-plaza.ogg", amb_plaza, "96k"),
        ("amb-lobby.ogg", amb_lobby, "96k"),
        ("amb-elevator.ogg", amb_elevator, "96k"),
        ("amb-floor.ogg", amb_floor, "96k"),
    ]
    for name, fn, br in tower_ogg:
        print(f"  {name}...")
        audio = fn()
        wav_path = TMP / (name.replace(".ogg", ".wav"))
        write_wav(wav_path, audio)
        wav_to_ogg(wav_path, OUT / name, bitrate=br)
        print(f"    -> {(OUT / name).stat().st_size} bytes")
    tower_wav = [
        ("sfx-badge-beep.wav", sfx_badge_beep),
        ("sfx-badge-deny.wav", sfx_badge_deny),
        ("sfx-elevator-ding.wav", sfx_elevator_ding),
    ]
    for name, fn in tower_wav:
        print(f"  {name}...")
        write_wav(OUT / name, fn())
        print(f"    -> {(OUT / name).stat().st_size} bytes")

    # cleanup temp wavs
    for p in TMP.glob("*.wav"):
        p.unlink()
    try:
        TMP.rmdir()
    except OSError:
        pass

    print("Done.")


if __name__ == "__main__":
    main()
