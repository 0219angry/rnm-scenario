import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const strUrl = searchParams.get('url');


  if(!strUrl) return;
      const url = new URL(strUrl);
      const isBooth = url.hostname === "booth.pm" || url.hostname.endsWith(".booth.pm");
      if (!isBooth) {
        return NextResponse.json({ error: '無効なURLです' }, { status: 400 });
      }

  try {
    const response = await axios.get(strUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const $ = cheerio.load(response.data);

    // すべての価格を取得（¥記号とスペース除去）
    const prices: number[] = $('.variation-price')
      .map((_, el) => {
        const text = $(el).text().replace(/[¥,\s]/g, '');
        const price = parseInt(text, 10);
        return isNaN(price) ? null : price;
      })
      .get()
      .filter((p): p is number => p !== null);

    if (prices.length === 0) {
      return NextResponse.json({ error: '価格が見つからなかったよ〜' }, { status: 404 });
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return NextResponse.json({
      priceRange: prices.length > 1 ? `¥${min}〜¥${max}` : `¥${min}`,
      min,
      max,
    });
  } catch (err) {
    console.error('Boothスクレイピング失敗:', err);
    return NextResponse.json({ error: 'スクレイピングに失敗しました' }, { status: 500 });
  }
}
