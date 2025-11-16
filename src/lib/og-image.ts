import satori from "satori";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { html as toReactElement } from "satori-html";

let wasmInitialized = false;

interface OGImageOptions {
  title: string;
  description?: string;
  date?: string;
}

export async function generateOGImage(options: OGImageOptions): Promise<Uint8Array> {
  const { title, description, date } = options;

  // Initialize WASM once
  if (!wasmInitialized) {
    await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm"));
    wasmInitialized = true;
  }

  // Use Vercel's public Inter font
  const fontUrl = "https://og-playground.vercel.app/inter-latin-ext-700-normal.woff";
  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
  }
  const fontData = await fontResponse.arrayBuffer();

  const html = `
    <div style="display: flex; width: 1200px; height: 630px; background: #101113; color: #f8f8f2; font-family: Inter;">
      <div style="display: flex; flex-direction: column; padding: 80px; flex: 1; justify-content: space-between;">
        <div style="display: flex; flex-direction: column;">
          <div style="display: flex; font-size: 24px; color: #8b8b8b; margin-bottom: 40px;">[The Null Hypothesis]</div>
          ${
    date
      ? `<div style="display: flex; font-size: 20px; color: #8b8b8b; margin-bottom: 20px;">${date}</div>`
      : '<div style="display: none;"></div>'
  }
          <div style="display: flex; font-size: 56px; font-weight: 700; line-height: 1.2; color: #f8f8f2; max-width: 1000px;">${title}</div>
        </div>
        <div style="display: flex; flex-direction: column;">
          ${
    description
      ? `<div style="display: flex; font-size: 28px; color: #8b8b8b; margin-bottom: 30px; max-width: 900px; line-height: 1.4;">${description}</div>`
      : '<div style="display: none;"></div>'
  }
          <div style="display: flex; font-size: 20px; color: #00ff41;">kumak.dev</div>
        </div>
      </div>
    </div>
  `;

  const svg = await satori(toReactElement(html), {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg);
  return resvg.render().asPng();
}
