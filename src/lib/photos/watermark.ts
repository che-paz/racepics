import sharp from "sharp";

export async function applyWatermark(
  imageBuffer: Buffer,
  text = "RacePics"
): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;
  const height = metadata.height ?? 800;
  const fontSize = Math.max(28, Math.floor(width / 18));

  const escaped = text.replace(/[<>&'"]/g, "");
  const svg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="50%"
        y="${height - Math.floor(fontSize * 0.8)}"
        font-size="${fontSize}"
        font-family="Arial, Helvetica, sans-serif"
        font-weight="600"
        fill="white"
        fill-opacity="0.55"
        text-anchor="middle"
      >${escaped}</text>
    </svg>
  `);

  return image
    .composite([{ input: svg, gravity: "center" }])
    .toBuffer();
}
