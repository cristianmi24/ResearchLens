/**
 * Extrae el texto de un PDF, Word (.docx) o texto plano en el propio navegador: el archivo nunca sale del
 * equipo, solo se envía su texto. Las librerías se cargan bajo demanda para no pesar en el resto de la app.
 */

export const ACCEPTED_EXTENSIONS = ".pdf,.docx,.txt,.md";
const MAX_FILE_MB = 25;

export class ExtractError extends Error {}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    // Se conservan los saltos de línea del PDF: los títulos de sección quedan en su propia línea.
    let pageText = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      pageText += item.str + (item.hasEOL ? "\n" : "");
    }
    pages.push(pageText);
  }
  return pages.join("\n");
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new ExtractError(`El archivo supera ${MAX_FILE_MB} MB.`);
  }
  const name = file.name.toLowerCase();
  let text: string;
  if (name.endsWith(".pdf")) text = await extractPdf(file);
  else if (name.endsWith(".docx")) text = await extractDocx(file);
  else if (name.endsWith(".txt") || name.endsWith(".md")) text = await file.text();
  else throw new ExtractError("Formato no admitido. Usa PDF, Word (.docx) o texto.");

  const clean = text.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length < 200) {
    throw new ExtractError("No se pudo leer texto del archivo. Si es un PDF escaneado (imagen), conviértelo a texto primero.");
  }
  return clean;
}
