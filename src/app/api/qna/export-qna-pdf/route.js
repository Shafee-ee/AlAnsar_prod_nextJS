import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

export async function GET() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansKannada-Regular.ttf",
  );

  const fontBytes = fs.readFileSync(fontPath);

  console.log("Font bytes:", fontBytes.length);

  const font = await pdfDoc.embedFont(fontBytes);

  console.log("Font embedded successfully");

  const page = pdfDoc.addPage([595, 842]);

  const text = "ಒಂದು ಪರೀಕ್ಷೆ";

  console.log(text);

  page.drawText(text, {
    x: 50,
    y: 700,
    size: 20,
    font,
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="test.pdf"',
    },
  });
}
