"use client";

import { FormEvent, useMemo, useState } from "react";

type TikTokResult = {
  id: string;
  title: string;
  cover: string;
  author: string;
  username: string;
  duration: number;
  type: "photo" | "video";
  video: string;
  hd: string;
  music: string;
  images: string[];
  stats: { play: number; likes: number };
};

type Mode = "hd" | "video" | "mp3" | "photo";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<TikTokResult | null>(null);
  const [mode, setMode] = useState<Mode>("hd");
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPhoto = result?.type === "photo";
  const downloadItems = useMemo(() => {
    if (!result) return [];
    if (result.type === "photo") {
      return result.images.map((image, index) => ({ url: image, label: `Foto ${index + 1}`, index }));
    }
    return [];
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setSelectedImages([]);
    setLoading(true);

    try {
      const response = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengambil data TikTok.");
      setResult(data as TikTokResult);
      setMode(data.type === "photo" ? "photo" : "hd");
      setSelectedImages((data.images ?? []).map((_: string, index: number) => index));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function toggleImage(index: number) {
    setSelectedImages((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  function downloadSelectedPhotos() {
    if (!result) return;
    const urls = selectedImages.map((index) => result.images[index]).filter(Boolean);
    urls.forEach((image, index) => {
      window.setTimeout(() => window.open(image, "_blank", "noopener,noreferrer"), index * 180);
    });
  }

  const activeDownload = result ? mode === "mp3" ? result.music : mode === "hd" ? result.hd : result.video : "";

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="xyrtik home">
          <span className="brand-mark"><i className="fa-solid fa-arrow-down-to-line" /></span>
          <span>xyrtik<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right"><span className="status-dot" /> FREE TIKTOK TOOL</div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span>01</span> TIKTOK DOWNLOADER</div>
        <h1>YOUR VIDEO.<br /><span>YOUR DOWNLOAD.</span></h1>
        <p className="hero-copy">Simpan video, audio, dan photo slide TikTok dengan mudah. Tempel tautannya, pilih format, lalu download.</p>

        <form className="url-form" onSubmit={handleSubmit}>
          <label className="input-label" htmlFor="tiktok-url">TAUTAN TIKTOK</label>
          <div className="input-row">
            <i className="fa-solid fa-link input-icon" />
            <input id="tiktok-url" type="url" placeholder="https://www.tiktok.com/@user/video/..." value={url} onChange={(event) => setUrl(event.target.value)} required />
            {url && <button className="clear-button" type="button" onClick={() => setUrl("")} aria-label="Hapus tautan"><i className="fa-solid fa-xmark" /></button>}
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin" /> MEMPROSES...</> : <>AMBIL MEDIA <i className="fa-solid fa-arrow-right" /></>}
          </button>
          <p className="form-note"><i className="fa-solid fa-shield-halved" /> Tidak perlu login. Gunakan tautan postingan publik.</p>
        </form>

        {error && <div className="error-box" role="alert"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

        {result && (
          <section className="result-panel" aria-live="polite">
            <div className="result-heading"><span className="section-number">02 / HASIL</span><span className="result-type">{isPhoto ? "PHOTO SLIDE" : "VIDEO POST"}</span></div>
            <div className="media-summary">
              {result.cover && <img className="cover-image" src={result.cover} alt="Pratinjau postingan TikTok" />}
              <div className="media-info">
                <span className="creator">@{result.username || result.author}</span>
                <h2>{result.title}</h2>
                <p>{isPhoto ? `${result.images.length} foto tersedia` : `${result.duration || 0} detik`}</p>
              </div>
            </div>
            {isPhoto ? (
              <>
                <div className="photo-head"><h3>PILIH FOTO</h3><button type="button" className="text-button" onClick={() => setSelectedImages(selectedImages.length === result.images.length ? [] : result.images.map((_, index) => index))}>{selectedImages.length === result.images.length ? "BATALKAN SEMUA" : "PILIH SEMUA"}</button></div>
                <div className="photo-grid">
                  {downloadItems.map((item) => (
                    <button type="button" key={item.index} className={`photo-item ${selectedImages.includes(item.index) ? "selected" : ""}`} onClick={() => toggleImage(item.index)} aria-pressed={selectedImages.includes(item.index)}>
                      <img src={item.url} alt={item.label} loading="lazy" />
                      <span className="photo-check"><i className={`fa-solid ${selectedImages.includes(item.index) ? "fa-check" : "fa-plus"}`} /></span>
                      <span className="photo-label">{item.label}</span>
                    </button>
                  ))}
                </div>
                <button className="primary-button download-button" type="button" disabled={!selectedImages.length} onClick={downloadSelectedPhotos}>BUKA {selectedImages.length} FOTO TERPILIH <i className="fa-solid fa-arrow-up-right-from-square" /></button>
                <p className="small-warning">Foto dibuka satu per satu di tab baru. Simpan melalui menu browser karena dukungan unduhan langsung berbeda antar perangkat.</p>
              </>
            ) : (
              <>
                <div className="format-heading"><h3>PILIH FORMAT</h3><span>01 — 03</span></div>
                <div className="format-options">
                  <button type="button" className={`format-card ${mode === "hd" ? "active" : ""}`} onClick={() => setMode("hd")} disabled={!result.hd}>
                    <span className="format-icon"><i className="fa-solid fa-film" /></span><span className="format-text"><b>VIDEO HD</b><small>Kualitas tinggi</small></span><span className="format-radio" />
                  </button>
                  <button type="button" className={`format-card ${mode === "video" ? "active" : ""}`} onClick={() => setMode("video")} disabled={!result.video}>
                    <span className="format-icon"><i className="fa-solid fa-circle-play" /></span><span className="format-text"><b>VIDEO NO WM</b><small>Video tanpa watermark jika tersedia</small></span><span className="format-radio" />
                  </button>
                  <button type="button" className={`format-card ${mode === "mp3" ? "active" : ""}`} onClick={() => setMode("mp3")} disabled={!result.music}>
                    <span className="format-icon"><i className="fa-solid fa-music" /></span><span className="format-text"><b>AUDIO MP3</b><small>Audio saja</small></span><span className="format-radio" />
                  </button>
                </div>
                <a className={`primary-button download-button ${!activeDownload ? "disabled-link" : ""}`} href={activeDownload || undefined} target="_blank" rel="noreferrer" download>
                  DOWNLOAD {mode === "mp3" ? "MP3" : mode === "hd" ? "VIDEO HD" : "VIDEO"} <i className="fa-solid fa-download" />
                </a>
                <p className="small-warning">Ketersediaan HD dan audio mengikuti respons TikWM. Tautan media berasal dari penyedia pihak ketiga.</p>
              </>
            )}
          </section>
        )}
      </section>

      <section className="features">
        <div className="section-top"><span className="section-number">02 / FITUR</span><span className="section-caption">SIMPLE. FAST. PRACTICAL.</span></div>
        <div className="feature-grid">
          <article className="feature-card"><div className="feature-icon"><i className="fa-solid fa-video" /></div><span className="feature-index">01</span><h3>VIDEO HD</h3><p>Ambil kualitas HD apabila versi tersebut tersedia dari API.</p></article>
          <article className="feature-card"><div className="feature-icon"><i className="fa-solid fa-droplet-slash" /></div><span className="feature-index">02</span><h3>NO WATERMARK</h3><p>Gunakan tautan video tanpa watermark yang disediakan TikWM.</p></article>
          <article className="feature-card"><div className="feature-icon"><i className="fa-solid fa-headphones" /></div><span className="feature-index">03</span><h3>MP3 AUDIO</h3><p>Simpan audio terpisah jika tautan musik tersedia.</p></article>
          <article className="feature-card"><div className="feature-icon"><i className="fa-solid fa-images" /></div><span className="feature-index">04</span><h3>PHOTO SLIDE</h3><p>Pilih foto tertentu dari postingan carousel sebelum membukanya.</p></article>
        </div>
      </section>

      <section className="how-section">
        <div><span className="section-number">03 / CARA PAKAI</span><h2>THREE STEPS.<br />THAT'S IT.</h2></div>
        <div className="steps">
          <div className="step"><span>01</span><div><h3>Salin tautan</h3><p>Salin link postingan publik dari aplikasi TikTok.</p></div></div>
          <div className="step"><span>02</span><div><h3>Tempel di xyrtik</h3><p>Tekan Ambil Media untuk memuat pilihan yang tersedia.</p></div></div>
          <div className="step"><span>03</span><div><h3>Pilih dan simpan</h3><p>Pilih format video, MP3, atau foto yang kamu inginkan.</p></div></div>
        </div>
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#"><span>xyrtik<span className="brand-dot">.</span></span></a><p>Gunakan secara bertanggung jawab. Hormati hak cipta dan privasi kreator.</p><span className="footer-tag"> © XyrexxArchive 2026</span></footer>
    </main>
  );
}
