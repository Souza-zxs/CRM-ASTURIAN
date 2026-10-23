import { BlockNoteEditor, type PartialBlock } from '@blocknote/core';
import {
  PDFExporter,
  pdfDefaultSchemaMappings,
} from '@blocknote/xl-pdf-exporter';
import { Font, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

const registerGeistFonts = (() => {
  let registrationPromise: Promise<void> | null = null;

  return () => {
    if (!registrationPromise) {
      registrationPromise = Promise.resolve().then(() => {
        Font.register({
          family: 'Geist',
          fonts: [
            {
              src: 'https://cdn.jsdelivr.net/npm/geist@1.8.2/dist/fonts/geist-sans/Geist-Regular.ttf',
              fontWeight: 400,
            },
            {
              src: 'https://cdn.jsdelivr.net/npm/geist@1.8.2/dist/fonts/geist-sans/Geist-Medium.ttf',
              fontWeight: 500,
            },
            {
              src: 'https://cdn.jsdelivr.net/npm/geist@1.8.2/dist/fonts/geist-sans/Geist-SemiBold.ttf',
              fontWeight: 600,
            },
          ],
        });
      });
    }
    return registrationPromise;
  };
})();

export const exportBlockNoteEditorToPdf = async (
  parsedBody: PartialBlock[],
  filename: string,
) => {
  await registerGeistFonts();

  const editor = BlockNoteEditor.create({
    initialContent: parsedBody,
  });

  const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings, {
    resolveFileUrl: async (url: string) => {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch asset at ${url}: ${response.status} ${response.statusText}`,
          );
        }

        return await response.blob();
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Failed to fetch asset')
        ) {
          throw error;
        }
        throw new Error(
          `Failed to fetch asset at ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
  });

  const pdfDocument = await exporter.toReactPDFDocument(editor.document);

  const blob = await pdf(pdfDocument).toBlob();
  saveAs(blob, `${filename}.pdf`);
};
