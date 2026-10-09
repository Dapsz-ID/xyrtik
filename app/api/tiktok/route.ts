import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validTikTokUrl(value: string) {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com", "m.tiktok.com"].includes(host);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url || url.length > 2000 || !validTikTokUrl(url)) {
      return NextResponse.json({ error: "Masukkan tautan TikTok yang valid." }, { status: 400 });
    }

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 xyrtik/1.0"
      },
      body: new URLSearchParams({ url, hd: "1" }),
      cache: "no-store",
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: "TikWM sedang tidak bisa dihubungi. Coba lagi nanti." }, { status: 502 });
    }

    const result = await response.json();

    if (result?.code !== 0 || !result?.data) {
      return NextResponse.json({ error: result?.msg || "Konten tidak ditemukan atau tidak bisa diakses." }, { status: 404 });
    }

    const data = result.data;
    const author = data.author ?? {};
    const images = Array.isArray(data.images) ? data.images.filter((image: unknown) => typeof image === "string") : [];

    return NextResponse.json({
      id: String(data.id ?? ""),
      title: String(data.title ?? "TikTok media"),
      cover: String(data.cover ?? data.origin_cover ?? ""),
      author: String(author.nickname ?? author.unique_id ?? "TikTok creator"),
      username: String(author.unique_id ?? ""),
      duration: Number(data.duration ?? 0),
      type: images.length > 0 ? "photo" : "video",
      video: String(data.play ?? ""),
      hd: String(data.hdplay ?? data.play ?? ""),
      music: String(data.music ?? ""),
      images,
      stats: {
        play: Number(data.play_count ?? 0),
        likes: Number(data.digg_count ?? 0)
      }
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan saat memproses tautan. Silakan coba lagi." }, { status: 500 });
  }
}
