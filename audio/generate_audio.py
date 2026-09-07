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
    """Crossfade start/end so loop has no click; match drone energy."""
    n = int(sr * fade_ms / 1000)
    if n < 2 or len(x) < 2 * n:
        return fade_edges(x, 5, sr)
    y = x.copy()
    # equal-power-ish crossfade of tail into head
    fade_out = np.linspace(1, 0, n)
    fade_in = np.linspace(0, 1, n)
    head = y[:n].copy()
    tail = y[-n:].copy()
    blended = tail * fade_out + head * fade_in
    y[-n:] = blended
    y[:n] = blended
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


def midi_hz(m):
    return 440.0 * (2.0 ** ((m - 69) / 12.0))


def chord_tones(root_midi, quality="min"):
    """Cheap triad (+ optional wrong color tone) from MIDI root."""
    if quality == "min":
        iv = [0, 3, 7]
    elif quality == "maj":
        iv = [0, 4, 7]
    elif quality == "dim":
        iv = [0, 3, 6]
    elif quality == "sus2":
        iv = [0, 2, 7]
    elif quality == "min_addb9":  # slightly wrong / depressed
        iv = [0, 3, 7, 13]
    else:
        iv = [0, 3, 7]
    return [midi_hz(root_midi + i) for i in iv]


def shifting_chord_pad(n, progression, bars_per_chord, bpm, sr=SR, amp=0.12):
    """Layered lo-fi pad that steps root/quality every N bars (not a static drone)."""
    beat = 60.0 / bpm
    bar = beat * 4.0
    chord_len = max(1, int(bars_per_chord * bar * sr))
    out = np.zeros(n)
    t = 0
    idx = 0
    while t < n:
        root, qual = progression[idx % len(progression)]
        freqs = chord_tones(root, qual)
        seg_n = min(chord_len, n - t)
        pad = np.zeros(seg_n)
        for j, f in enumerate(freqs):
            # slight detune + octave mix for tracker mush
            det = 1.0 + RNG.uniform(-0.004, 0.004)
            w = 0.55 / (1 + j) * sine(f * det, seg_n, sr)
            w += 0.22 / (1 + j) * triangle(f * 0.5 * det, seg_n, sr)
            if j == 0:
                w += 0.18 * sine(f * 0.5, seg_n, sr)  # sub root
            pad += w
        # slow internal wander within the chord block
        lfo = 0.82 + 0.18 * sine(0.04 + 0.01 * (idx % 3), seg_n, sr, phase=idx * 0.7)
        # short crossfade into next chord to avoid clicks
        fade = min(int(0.12 * sr), seg_n // 4)
        env = np.ones(seg_n)
        if fade > 1:
            env[:fade] = np.linspace(0, 1, fade)
            env[-fade:] = np.linspace(1, 0, fade)
        pad = bitcrush(pad * lfo * env, bits=11)
        out[t : t + seg_n] += pad * amp
        t += seg_n
        idx += 1
    return one_pole_lp(out, 2800, sr)


def lofi_perc_bed(n, bpm, sr=SR, intensity=0.55, seed_phase=0):
    """Sparse tracker-style kicks/hats/noise hits; pattern morphs every 8 bars."""
    beat = 60.0 / bpm
    out = np.zeros(n)
    # pattern banks: list of (beat_offset, kind, vel) within a 4-beat bar
    banks = [
        # A: lonely pulse
        [(0.0, "kick", 0.7), (2.0, "hat", 0.35), (3.0, "hat", 0.2)],
        # B: add offbeat dust
        [(0.0, "kick", 0.65), (1.5, "hat", 0.3), (2.0, "kick", 0.4), (2.5, "noise", 0.25), (3.5, "hat", 0.28)],
        # C: shuffle-ish
        [(0.0, "kick", 0.6), (0.75, "hat", 0.22), (2.0, "kick", 0.45), (2.75, "hat", 0.3), (3.25, "noise", 0.18)],
        # D: emptier / tired
        [(0.0, "kick", 0.5), (3.0, "hat", 0.25), (3.5, "noise", 0.15)],
    ]
    bars_total = int(np.ceil((n / sr) / (beat * 4)))
    for bar_i in range(bars_total + 1):
        bank = banks[(bar_i // 8 + seed_phase) % len(banks)]
        # every 16 bars, thin the pattern further
        thin = (bar_i % 16) >= 12
        bar_t0 = bar_i * 4.0 * beat
        for off, kind, vel in bank:
            if thin and kind == "noise":
                continue
            if thin and kind == "hat" and vel < 0.3:
                continue
            # micro timing drift (tracker humanize)
            drift = RNG.uniform(-0.012, 0.012)
            start = int((bar_t0 + off + drift) * sr)
            if start < 0 or start >= n:
                continue
            if kind == "kick":
                kn = min(int(0.11 * sr), n - start)
                tt = np.arange(kn) / sr
                kf = (78 + 8 * intensity) * np.exp(-tt * 26)
                kick = np.sin(2 * np.pi * np.cumsum(kf) / sr)
                kick *= env_adsr(kn, 0.001, 0.035, 0.2, 0.05, sr)
                kick = bitcrush(kick, bits=9)
                out[start : start + kn] += kick * (0.16 * intensity * vel)
            elif kind == "hat":
                hn = min(int(0.045 * sr), n - start)
                hat = one_pole_hp(noise(hn), 4500, sr)
                hat *= env_adsr(hn, 0.0008, 0.008, 0.12, 0.025, sr)
                hat = bitcrush(downsample_upsample(hat, 2), bits=8)
                out[start : start + hn] += hat * (0.045 * intensity * vel)
            else:  # noise hit / rim
                nn = min(int(0.06 * sr), n - start)
                hit = bandpass(noise(nn), 1200, 5000, sr)
                hit *= env_adsr(nn, 0.001, 0.015, 0.15, 0.03, sr)
                hit = bitcrush(hit, bits=8, rate_div=2)
                out[start : start + nn] += hit * (0.05 * intensity * vel)
    return one_pole_lp(out, 6000, sr)


def sparse_lonely_notes(n, sr=SR, progression=None, bars_per_chord=12, bpm=72.0):
    """Sparse detuned chiptune notes that follow shifting roots — lonely cubicle."""
    if progression is None:
        progression = [(57, "min"), (53, "maj"), (55, "min"), (57, "min_addb9")]  # A F G A(wrong)
    beat = 60.0 / bpm
    bar = beat * 4.0
    chord_dur = bars_per_chord * bar
    out = np.zeros(n)
    t = int(0.9 * sr)
    note_i = 0
    while t < n - int(1.0 * sr):
        chord_idx = int((t / sr) / chord_dur) % len(progression)
        root, qual = progression[chord_idx]
        tones = chord_tones(root, qual)
        # pick chord tone or occasional wrong neighbor
        if note_i % 7 == 6:
            f = tones[0] * (2 ** (RNG.choice([-1, 1]) / 12.0))  # half-step wrong
        else:
            f = float(RNG.choice(tones)) * (2 ** int(RNG.integers(0, 2)))
        f *= RNG.uniform(0.990, 1.010)
        dur = int(RNG.uniform(0.7, 2.0) * sr)
        dur = min(dur, n - t)
        tone = 0.55 * triangle(f, dur, sr) + 0.25 * sine(f * 2.01, dur, sr)
        tone = bitcrush(tone, bits=9, rate_div=2)
        e = env_adsr(dur, 0.05, 0.2, 0.35, 0.55, sr)
        out[t : t + dur] += tone * e * RNG.uniform(0.07, 0.13)
        # occasional answering interval
        if note_i % 5 == 2 and t + dur + int(0.3 * sr) < n:
            f2 = tones[min(1, len(tones) - 1)] * RNG.uniform(0.995, 1.005)
            d2 = int(RNG.uniform(0.4, 1.0) * sr)
            d2 = min(d2, n - (t + int(0.25 * sr)))
            st2 = t + int(0.25 * sr)
            ans = 0.4 * sine(f2, d2, sr) + 0.2 * triangle(f2, d2, sr)
            ans = bitcrush(ans, bits=9, rate_div=2)
            out[st2 : st2 + d2] += ans * env_adsr(d2, 0.04, 0.15, 0.3, 0.4, sr) * 0.08
        note_i += 1
        t += int(RNG.uniform(2.2, 5.5) * sr)
    return one_pole_lp(out, 3200, sr)


def grind_loop_motif(n, sr=SR, progression=None, bars_per_chord=8, bpm=92.3):
    """Repetitive off-kilter desktop grind — tracker feel with root drift."""
    if progression is None:
        # Gmin → Eb → F → Gmin(flat) — office loop that drifts wrong
        progression = [(55, "min"), (51, "maj"), (53, "maj"), (55, "min_addb9")]
    beat = 60.0 / bpm
    bar = beat * 4.0
    chord_dur = bars_per_chord * bar
    out = np.zeros(n)
    # scale degrees relative to root (semitones): 0, +3, +7, +6 (wrong)
    rel = [0, 3, 7, 6]
    i = 0
    t = 0.0
    while int(t * sr) < n:
        chord_idx = int(t / chord_dur) % len(progression)
        root, _qual = progression[chord_idx]
        # pattern step
        step = rel[i % 4]
        # every 8th cycle of the 4-note cell, flatten more
        if (i // 4) % 8 == 7:
            step -= 1
        f = midi_hz(root + step + 12)  # mid register
        # mid-loop: swap last note of cell to a different wrong interval
        phase = int(t / (chord_dur * 2))
        if phase % 2 == 1 and i % 4 == 3:
            f = midi_hz(root + 8)  # #5 / wrong
        dur = int(beat * 0.85 * sr)
        start = int(t * sr)
        if start + dur > n:
            break
        wave_ = 0.5 * square(f, dur, sr, duty=0.4) + 0.3 * triangle(f * 0.5, dur, sr)
        wave_ = bitcrush(downsample_upsample(wave_, 3), bits=10)
        e = env_adsr(dur, 0.005, 0.08, 0.4, 0.15, sr)
        if i % 2 == 0:
            bass = soft_limit(
                sine(midi_hz(root - 12), dur, sr)
                * env_adsr(dur, 0.01, 0.1, 0.5, 0.2, sr)
            ) * 0.28
            out[start : start + dur] += bass
        out[start : start + dur] += wave_ * e * 0.14
        # ghost hihat — denser in odd pattern phases
        if i % 2 == 1 or (phase % 2 == 1 and i % 4 == 0):
            tick_n = min(400, dur)
            tick = (
                one_pole_hp(noise(tick_n), 4000, sr)
                * env_adsr(tick_n, 0.001, 0.01, 0.1, 0.03, sr)
                * (0.04 if i % 2 == 1 else 0.028)
            )
            out[start : start + tick_n] += tick
        i += 1
        t += beat
    return one_pole_lp(out, 4800, sr)


def tense_tracker_motif(n, sr=SR, progression=None, bars_per_chord=8, bpm=118.0):
    """PR fight — tense cheap tracker with chord pressure shifts."""
    if progression is None:
        # Amin → Bbmaj → Amin → Gmin — slight ratcheting dread
        progression = [(57, "min"), (58, "maj"), (57, "min_addb9"), (55, "min")]
    beat = 60.0 / bpm
    bar = beat * 4.0
    chord_dur = bars_per_chord * bar
    out = np.zeros(n)
    # relative climb then wrong drop — transposed by root
    rel_notes = [0, 3, 7, 8, 12, 10]
    i = 0
    t = 0.0
    while int(t * sr) < n:
        chord_idx = int(t / chord_dur) % len(progression)
        root, _q = progression[chord_idx]
        # second half of loop: tighten rhythm accents
        late = t > (n / sr) * 0.5
        f = midi_hz(root + rel_notes[i % len(rel_notes)])
        dur = int(beat * (0.5 if late else 0.55) * sr)
        start = int(t * sr)
        if start + dur > n:
            break
        lead = 0.45 * square(f, dur, sr, duty=0.35) + 0.2 * saw(f * 1.005, dur, sr)
        lead = bitcrush(downsample_upsample(lead, 2), bits=9)
        e = env_adsr(dur, 0.002, 0.05, 0.35, 0.12, sr)
        out[start : start + dur] += lead * e * (0.17 if late else 0.15)
        # kick on 1 and 3 of 8th grid
        if i % 4 == 0 or i % 4 == 2:
            kn = min(int(0.12 * sr), dur)
            tt = np.arange(kn) / sr
            kf = 95 * np.exp(-tt * 28)
            kick = np.sin(2 * np.pi * np.cumsum(kf) / sr)
            kick *= env_adsr(kn, 0.001, 0.04, 0.2, 0.05, sr)
            out[start : start + kn] += kick * (0.24 if late else 0.2)
        if i % 4 == 1 or i % 4 == 3:
            sn = min(int(0.08 * sr), dur)
            snare = one_pole_hp(noise(sn), 2000, sr) * env_adsr(
                sn, 0.001, 0.02, 0.15, 0.04, sr
            )
            out[start : start + sn] += snare * (0.1 if late else 0.085)
        # extra offbeat noise in late section
        if late and i % 8 == 5:
            xn = min(int(0.04 * sr), dur)
            xh = bandpass(noise(xn), 2000, 6000, sr) * env_adsr(
                xn, 0.001, 0.01, 0.1, 0.02, sr
            )
            out[start : start + xn] += xh * 0.06
        i += 1
        t += beat * 0.5
    # occasional alarm-ish blip (sparse)
    for _ in range(7):
        at = int(RNG.uniform(0.08, 0.92) * n)
        bl = int(0.055 * sr)
        if at + bl > n:
            continue
        blip = square(880 * RNG.uniform(0.95, 1.05), bl, sr) * env_adsr(
            bl, 0.001, 0.01, 0.2, 0.03, sr
        )
        out[at : at + bl] += blip * 0.045
    return soft_limit(one_pole_lp(out, 5200, sr) * 0.9)


# ---------------------------------------------------------------------------
# BGM generators
# ---------------------------------------------------------------------------

def gen_bgm_cubicle_walk():
    """Lonely walk BGM — HVAC bed + shifting minor pads + sparse notes + soft perc."""
    dur = 76.0  # ~60–90s, clean loop
    n = int(dur * SR)
    bpm = 72.0
    # Am → F → Em → Am(b9) every 12 bars (~40s cycle feels slow/lonely)
    prog = [(57, "min"), (53, "maj"), (52, "min"), (57, "min_addb9")]
    bars_per = 12
    mix = (
        hvac_drone(n) * 0.95
        + fluorescent_hum(n) * 1.05
        + printer_chatter(n) * 0.85
        + shifting_chord_pad(n, prog, bars_per, bpm, amp=0.10) * 1.0
        + sparse_lonely_notes(n, progression=prog, bars_per_chord=bars_per, bpm=bpm) * 1.05
        + lofi_perc_bed(n, bpm, intensity=0.38, seed_phase=0) * 0.85
    )
    whine = sine(15600, n) * 0.0035 * (0.5 + 0.5 * sine(0.04, n))
    mix = mix + whine
    mix = soft_limit(mix * 0.92)
    mix = make_loopable(mix, fade_ms=140)
    return normalize(mix, peak_db=-7.0)


def gen_bgm_seated_desktop():
    """Repetitive-but-drifting grind — ostinato follows chord shifts, perc morphs."""
    dur = 72.0
    n = int(dur * SR)
    bpm = 92.3
    prog = [(55, "min"), (51, "maj"), (53, "maj"), (55, "min_addb9")]
    bars_per = 8
    mix = (
        hvac_drone(n) * 0.5
        + fluorescent_hum(n) * 0.65
        + shifting_chord_pad(n, prog, bars_per, bpm, amp=0.09) * 0.9
        + grind_loop_motif(n, progression=prog, bars_per_chord=bars_per, bpm=bpm) * 1.0
        + lofi_perc_bed(n, bpm, intensity=0.58, seed_phase=1) * 1.0
    )
    for _ in range(5):
        at = int(RNG.uniform(6, dur - 4) * SR)
        pn = int(0.35 * SR)
        if at + pn > n:
            continue
        mix[at : at + pn] += hollow_chord(pn) * 0.04
    mix = soft_limit(mix)
    mix = make_loopable(mix, fade_ms=110)
    return normalize(mix, peak_db=-7.5)


def gen_bgm_pr_fight():
    """Slightly tenser PR fight — chord pressure + evolving tracker perc (still cheap)."""
    dur = 68.0
    n = int(dur * SR)
    bpm = 118.0
    prog = [(57, "min"), (58, "maj"), (57, "min_addb9"), (55, "min")]
    bars_per = 8
    mix = (
        hvac_drone(n) * 0.32
        + fluorescent_hum(n) * 0.38
        + shifting_chord_pad(n, prog, bars_per, bpm, amp=0.085) * 0.85
        + tense_tracker_motif(n, progression=prog, bars_per_chord=bars_per, bpm=bpm) * 1.0
        + lofi_perc_bed(n, bpm, intensity=0.72, seed_phase=2) * 0.7
    )
    mix = soft_limit(mix)
    mix = make_loopable(mix, fade_ms=95)
    return normalize(mix, peak_db=-6.5)


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



# ---------------------------------------------------------------------------
# Exhausted cubicle farm ambience + tired human one-shots
# ---------------------------------------------------------------------------

def muffled_worker_murmur(n, sr=SR, density=1.0):
    """Distant tired-human energy — no intelligible speech.

    density~1 = sparse; density~6+ = dense cubicle farm (~hundreds of bodies).
    Overlapping muffled formant mush, not chatter or words.
    """
    out = np.zeros(n)
    # Multiple independent lanes so neighbors overlap like a full farm.
    n_lanes = max(1, int(round(2 * density)))
    for _lane in range(n_lanes):
        t = int(RNG.uniform(0.2, 3.5) * sr)
        while t < n - int(0.25 * sr):
            dur = int(RNG.uniform(0.35, 1.6) * sr)
            dur = min(dur, n - t)
            base = noise(dur, "pink")
            f_lo = RNG.uniform(160, 300)
            f_hi = RNG.uniform(650, 1300)
            mur = bandpass(base, f_lo, f_hi, sr)
            mur += bandpass(
                noise(dur, "pink"),
                RNG.uniform(850, 1350),
                RNG.uniform(1500, 2300),
                sr,
            ) * RNG.uniform(0.25, 0.45)
            # soft pitch undertone (not melodic)
            f0 = RNG.uniform(95, 185)
            mur += sine(f0, dur, sr) * RNG.uniform(0.05, 0.1) * env_adsr(
                dur, 0.05, 0.15, 0.4, 0.3, sr
            )
            am_rate = RNG.uniform(3.0, 8.0)
            am = 0.3 + 0.7 * (0.5 + 0.5 * sine(am_rate, dur, sr, phase=RNG.uniform(0, 6)))
            breath = 0.65 + 0.35 * sine(RNG.uniform(0.35, 1.4), dur, sr)
            mur = mur * am * breath
            # distance muffling — farther lanes duller/quieter
            dist = RNG.uniform(0.0, 1.0)
            lp = 1600 - 900 * dist
            mur = one_pole_lp(mur, lp, sr)
            if dist > 0.45:
                mur = one_pole_lp(mur, 750, sr)
            # quiet; slightly louder when denser so mush reads as crowd energy
            mur *= RNG.uniform(0.008, 0.022) * (0.85 + 0.15 * min(density, 8) / 8)
            out[t : t + dur] += mur
            # short gaps when dense — overlapping farm, not sparse office
            gap = RNG.uniform(0.15, 1.1) if density >= 3 else RNG.uniform(2.5, 8.5)
            t += dur + int(gap * sr)
    return out


def distant_keyboard_clacks(n, sr=SR, density=1.0):
    """Unsycned distant mushy key energy — many overlapping typists when dense."""
    out = np.zeros(n)
    n_lanes = max(1, int(round(3 * density)))
    for _lane in range(n_lanes):
        t = int(RNG.uniform(0.1, 2.5) * sr)
        while t < n - int(0.04 * sr):
            # longer typing bursts from "neighbors"
            burst = int(RNG.integers(3, 14 if density >= 3 else 5))
            for _i in range(burst):
                kn = int(RNG.uniform(0.025, 0.065) * sr)
                if t + kn >= n:
                    break
                click = one_pole_lp(noise(kn), RNG.uniform(500, 1100), sr)
                click += sine(RNG.uniform(120, 210), kn) * 0.22
                # mush / rubber-dome dullness
                click = one_pole_lp(click, RNG.uniform(700, 1400), sr)
                click *= env_adsr(kn, 0.001, 0.008, 0.15, 0.02, sr) * RNG.uniform(
                    0.004, 0.014
                )
                out[t : t + kn] += click
                t += int(RNG.uniform(0.04, 0.12) * sr)
            # unsynced: short pauses between bursts when dense
            pause = RNG.uniform(0.2, 1.8) if density >= 3 else RNG.uniform(4.0, 12.0)
            t += int(pause * sr)
    return out


def baked_chair_and_sigh_energy(n, sr=SR, count_scrape=18, count_sigh=10):
    """Occasional distant chair scrapes + breathy sigh energy baked into the loop bed."""
    out = np.zeros(n)
    dur_s = n / sr
    for _ in range(count_scrape):
        at = int(RNG.uniform(1.0, max(2.0, dur_s - 1.5)) * sr)
        cn = int(RNG.uniform(0.18, 0.6) * sr)
        if at + cn > n:
            continue
        scrape = bandpass(noise(cn), 180, 950, sr)
        scrape += sine(RNG.uniform(130, 200), cn) * 0.08
        scrape *= env_adsr(cn, 0.04, 0.12, 0.35, 0.25, sr) * RNG.uniform(0.008, 0.02)
        scrape = one_pole_lp(scrape, RNG.uniform(600, 1200), sr)
        out[at : at + cn] += scrape
    for _ in range(count_sigh):
        at = int(RNG.uniform(1.5, max(3.0, dur_s - 2.0)) * sr)
        sn = int(RNG.uniform(0.45, 1.1) * sr)
        if at + sn > n:
            continue
        breath = noise(sn, "pink")
        bright = bandpass(breath, 350, 3800, sr)
        dull = one_pole_lp(breath, 800, sr)
        w = np.linspace(0.8, 0.2, sn)
        body = bright * w + dull * (1 - w)
        t = np.arange(sn) / sr
        f0 = RNG.uniform(120, 170) * np.exp(-t * RNG.uniform(0.8, 1.4))
        phase = 2 * np.pi * np.cumsum(f0) / sr
        tone = np.sin(phase) * 0.08 * np.linspace(1.0, 0.25, sn)
        sigh = (body * 0.45 + tone) * env_adsr(sn, 0.06, 0.2, 0.4, 0.35, sr)
        sigh = one_pole_lp(sigh, RNG.uniform(1400, 2400), sr)
        sigh *= RNG.uniform(0.006, 0.016)
        out[at : at + sn] += sigh
    return out


def gen_amb_cubicle_exhausted():
    """Dense fluorescent cubicle farm bed — ~272 bays / hundreds of tired seated neighbors.

    Overlapping muffled human energy + unsynced keyboard mush + occasional chair/sigh
    baked into the loop. Oppressive tiredness, not horror. Quiet peak for under walk BGM.
    """
    dur = 82.0  # mid 60–90s, slightly longer for dense mash
    n = int(dur * SR)
    # density tuned for "hundreds of seated neighbors" without becoming intelligible speech
    farm_density = 6.5
    mix = (
        hvac_drone(n) * 1.05
        + fluorescent_hum(n) * 1.15
        + muffled_worker_murmur(n, density=farm_density) * 1.35
        + distant_keyboard_clacks(n, density=farm_density) * 1.45
        + baked_chair_and_sigh_energy(n, count_scrape=22, count_sigh=12) * 1.0
    )
    # soft brown-air + very quiet continuous pink mush (crowd floor)
    air = one_pole_lp(noise(n, "brown"), 220, SR) * 0.055
    crowd_floor = one_pole_lp(
        bandpass(noise(n, "pink"), 200, 1600, SR), 1100, SR
    ) * 0.018
    crowd_floor *= 0.75 + 0.25 * sine(0.06, n)
    mix = mix + air + crowd_floor
    # mild PS1 grit, keep soft
    mix = bitcrush(mix, bits=12, rate_div=1)
    mix = soft_limit(mix * 0.82)
    mix = make_loopable(mix, fade_ms=160)
    # quiet enough to sit under / replace walk BGM (~−8…−10 dBFS)
    return normalize(mix, peak_db=-9.0)


def sfx_murmur_distant():
    """Quiet distant murmur one-shot — formant mush, no words."""
    n = int(RNG.uniform(0.55, 0.95) * SR)
    base = noise(n, "pink")
    mur = bandpass(base, RNG.uniform(180, 280), RNG.uniform(800, 1300), SR)
    mur += bandpass(noise(n, "pink"), 900, 2000, SR) * 0.3
    f0 = RNG.uniform(110, 170)
    mur += sine(f0, n) * 0.07 * env_adsr(n, 0.05, 0.15, 0.4, 0.3, SR)
    am = 0.35 + 0.65 * (0.5 + 0.5 * sine(RNG.uniform(4.0, 7.0), n))
    mur = one_pole_lp(mur * am, 1200, SR)
    mur = one_pole_lp(mur, 850, SR)
    out = mur * env_adsr(n, 0.04, 0.15, 0.4, 0.3, SR)
    out = bitcrush(out, bits=10, rate_div=2)
    return normalize(fade_edges(out, 10), peak_db=-7.0)


def sfx_keys_far():
    """Quiet far mushy key burst — unsynced neighbor typing."""
    n = int(0.55 * SR)
    out = np.zeros(n)
    t = int(0.02 * SR)
    burst = int(RNG.integers(5, 11))
    for _i in range(burst):
        kn = int(RNG.uniform(0.03, 0.06) * SR)
        if t + kn >= n:
            break
        click = one_pole_lp(noise(kn), RNG.uniform(550, 1000), SR)
        click += sine(RNG.uniform(130, 200), kn) * 0.2
        click = one_pole_lp(click, 1100, SR)
        click *= env_adsr(kn, 0.001, 0.008, 0.15, 0.02, SR) * RNG.uniform(0.35, 0.55)
        out[t : t + kn] += click
        t += int(RNG.uniform(0.045, 0.11) * SR)
    out = one_pole_lp(out, 1400, SR)
    out = bitcrush(out, bits=9, rate_div=2)
    return normalize(fade_edges(out, 6), peak_db=-6.5)


def sfx_grunt():
    """Short tired human grunt — synth vocal tract, not a sample."""
    n = int(0.38 * SR)
    # glottal-ish pulse + noise through formants
    t = np.arange(n) / SR
    f0 = 105 * np.exp(-t * 1.8)  # pitch drop of exhaustion
    phase = 2 * np.pi * np.cumsum(f0) / SR
    glot = np.sin(phase) * 0.55 + np.sin(2 * phase) * 0.18
    # buzzier square-ish component
    glot += 0.2 * np.sign(np.sin(phase))
    noise_part = bandpass(noise(n, "pink"), 200, 1800, SR) * 0.35
    body = glot + noise_part
    # formants ~F1/F2 for "uh"
    body = bandpass(body, 280, 900, SR) * 0.7 + bandpass(body, 700, 1600, SR) * 0.4
    body = one_pole_lp(body, 2200, SR)
    e = env_adsr(n, 0.015, 0.08, 0.45, 0.18, SR)
    out = body * e
    out = bitcrush(soft_limit(out * 1.1), bits=10)
    return normalize(fade_edges(out, 6), peak_db=-3.0)


def sfx_sigh():
    """Exhausted sigh — long breathy exhale."""
    n = int(0.85 * SR)
    t = np.arange(n) / SR
    # breath noise with falling brightness
    breath = noise(n, "pink")
    # sweep LP cutoff down (air leaving lungs)
    # approximate with staged filters
    bright = bandpass(breath, 400, 4500, SR)
    dull = one_pole_lp(breath, 900, SR)
    mix_w = np.linspace(0.85, 0.15, n)
    body = bright * mix_w + dull * (1 - mix_w)
    # soft pitch undertone dropping
    f0 = 160 * np.exp(-t * 1.2)
    phase = 2 * np.pi * np.cumsum(f0) / SR
    tone = np.sin(phase) * 0.12 * np.linspace(1.0, 0.2, n)
    out = body * 0.55 + tone
    # inhale-ish tiny lead-in then long exhale
    e = np.ones(n)
    atk = int(0.08 * SR)
    e[:atk] = np.linspace(0, 1, atk) ** 0.7
    # slow release
    rel = int(0.45 * SR)
    e[-rel:] *= np.linspace(1, 0, rel) ** 1.4
    # mid sustain dip for tiredness
    e *= 0.75 + 0.25 * sine(1.1, n)
    out = out * e * 0.7
    out = one_pole_lp(out, 3200, SR)
    out = bitcrush(out, bits=11)
    return normalize(fade_edges(out, 12), peak_db=-4.0)


def sfx_chair_creak_tired():
    """Slow tired chair creak — lean/shift, not sit-thump."""
    n = int(0.75 * SR)
    out = np.zeros(n)
    # no big sit thump — just slow wood strain
    creak_n = int(0.65 * SR)
    t = np.arange(creak_n) / SR
    # slower sweep than sfx_chair_sit
    creak_f = 140 + 55 * t + 25 * np.sin(2 * math.pi * 2.2 * t)
    phase = 2 * np.pi * np.cumsum(creak_f) / SR
    creak = np.sin(phase) * 0.4
    creak += np.sin(2 * phase) * 0.12
    creak += one_pole_bp_noise(creak_n, 300, 1600) * 0.22
    # stuttering friction
    creak *= 0.55 + 0.45 * (0.5 + 0.5 * square(7.5, creak_n, duty=0.6))
    e = env_adsr(creak_n, 0.06, 0.18, 0.4, 0.35, SR)
    # softer secondary creak later
    out[:creak_n] += creak * e * 0.85
    st2 = int(0.28 * SR)
    n2 = int(0.35 * SR)
    if st2 + n2 <= n:
        t2 = np.arange(n2) / SR
        f2 = 200 + 40 * t2 + 15 * np.sin(2 * math.pi * 4 * t2)
        ph2 = 2 * np.pi * np.cumsum(f2) / SR
        c2 = np.sin(ph2) * 0.25 + one_pole_bp_noise(n2, 400, 1800) * 0.15
        c2 *= env_adsr(n2, 0.04, 0.1, 0.35, 0.2, SR)
        out[st2 : st2 + n2] += c2 * 0.55
    out = one_pole_lp(out, 2800, SR)
    out = fade_edges(soft_limit(out), 10)
    return normalize(out, peak_db=-3.5)


def sfx_ugh():
    """Muffled distant 'ugh' — filtered, no clear words."""
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f0 = 95 * np.exp(-t * 2.0)
    phase = 2 * np.pi * np.cumsum(f0) / SR
    glot = np.sin(phase) * 0.5 + np.sin(phase * 2.01) * 0.2
    glot += bandpass(noise(n, "pink"), 150, 1200, SR) * 0.4
    # "ugh" formants — dark
    body = bandpass(glot, 200, 600, SR) * 0.8 + bandpass(glot, 500, 1100, SR) * 0.35
    # heavy muffling / distance
    body = one_pole_lp(body, 900, SR)
    body = one_pole_lp(body, 700, SR)
    e = env_adsr(n, 0.02, 0.1, 0.4, 0.22, SR)
    out = body * e
    # quiet + bitcrush for far cubicle
    out = bitcrush(out * 0.7, bits=9, rate_div=2)
    return normalize(fade_edges(out, 8), peak_db=-6.0)


def sfx_key_dead(variant=0):
    """Dead/mushy keyboard clack — flatter and duller than sfx_key."""
    # longer, softer, low-passed — rubber-dome death
    n = int((0.07 + 0.01 * (variant % 3)) * SR)
    # much lower click freqs than live keys (2100/2400/1850)
    f0 = [780, 920, 650, 840, 700][variant]
    thud_f = [160, 145, 175, 155, 168][variant]
    # soft noise clack, heavily filtered
    click = one_pole_lp(noise(n), 1400 - 80 * (variant % 3), SR)
    click *= env_adsr(n, 0.001, 0.012, 0.2, 0.03, SR)
    # dull mid thunk instead of bright square
    tone = sine(f0, n) * env_adsr(n, 0.0008, 0.01, 0.15, 0.025, SR) * 0.35
    # bottom-out mush
    thud_n = int(0.035 * SR)
    thud = sine(thud_f, thud_n) * env_adsr(thud_n, 0.001, 0.012, 0.25, 0.015, SR)
    out = click * 0.55 + tone * 0.5
    out[:thud_n] += thud * 0.55
    # extra dulling
    out = one_pole_lp(out, 1800 - 100 * (variant % 3), SR)
    out = bitcrush(out, bits=7 + (variant % 2), rate_div=2)
    # slightly quieter / flatter peaks
    return normalize(fade_edges(out, 2), peak_db=-5.0)



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
        wav_to_ogg(wav_path, OUT / name, bitrate="96k")
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
        ("sfx-grunt.wav", sfx_grunt),
        ("sfx-sigh.wav", sfx_sigh),
        ("sfx-chair-creak-tired.wav", sfx_chair_creak_tired),
        ("sfx-ugh.wav", sfx_ugh),
        ("sfx-key-dead-01.wav", lambda: sfx_key_dead(0)),
        ("sfx-key-dead-02.wav", lambda: sfx_key_dead(1)),
        ("sfx-key-dead-03.wav", lambda: sfx_key_dead(2)),
        ("sfx-key-dead-04.wav", lambda: sfx_key_dead(3)),
        ("sfx-key-dead-05.wav", lambda: sfx_key_dead(4)),
        ("sfx-murmur-distant.wav", sfx_murmur_distant),
        ("sfx-keys-far.wav", sfx_keys_far),
    ]
    for name, fn in sfx:
        print(f"  {name}...")
        audio = fn()
        write_wav(OUT / name, audio)
        print(f"    -> {(OUT / name).stat().st_size} bytes")

    print("Generating exhausted cubicle ambience...")
    amb_specs = [
        ("amb-cubicle-exhausted.ogg", gen_amb_cubicle_exhausted),
    ]
    for name, fn in amb_specs:
        print(f"  {name}...")
        audio = fn()
        wav_path = TMP / (name.replace(".ogg", ".wav"))
        write_wav(wav_path, audio)
        wav_to_ogg(wav_path, OUT / name, bitrate="96k")
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
