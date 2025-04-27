// app/api/translate/route.ts (使用 Next.js 13+/App Router)
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, fromLang = "zh-Hans", to = "en" } = await req.json();

  const res = await fetch(
    "https://cn.bing.com/ttranslatev3?isVertical=1&&IG=DDBB521557664BEFA3E0CDFFCF498A5B&IID=translator.5025",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
      body: new URLSearchParams({
        fromLang,
        to,
        text,
        tryFetchingGenderDebiasedTranslations: "true",
        token: "g2VgeCQzPOnhyeWd_N3c93Jud6nyVpoh",
        key: "1745486931960",
      }),
    }
  );

  const result = await res.json();
  return NextResponse.json(result);
}
