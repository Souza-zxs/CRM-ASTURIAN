import { type FileTypeParser as FileTypeParserType } from 'file-type';

// `file-type` and `@file-type/pdf` are ESM-only (no CJS "require" export
// condition) — a static import compiles to a `require()` in this
// CommonJS build and fails with ERR_REQUIRE_ESM / ERR_PACKAGE_PATH_NOT_EXPORTED
// (observed under Vercel's serverless runtime specifically). Building the
// import() call from a string via `new Function` hides it from SWC's
// static analysis, so it survives as a real dynamic import — Node's
// documented way for a CJS module to load an ESM one.
const dynamicImport = new Function(
  'specifier',
  'return import(specifier)',
) as (specifier: string) => Promise<unknown>;

type FileTypeParserBundle = {
  parser: FileTypeParserType;
  supportedMimeTypes: ReadonlySet<string>;
};

let fileTypeParserPromise: Promise<FileTypeParserBundle> | undefined;

export const getFileTypeParser = (): Promise<FileTypeParserBundle> => {
  const promise: Promise<FileTypeParserBundle> =
    fileTypeParserPromise ??
    (async () => {
      const [fileTypeModule, pdfModule] = await Promise.all([
        dynamicImport('file-type') as Promise<typeof import('file-type')>,
        dynamicImport('@file-type/pdf') as Promise<
          typeof import('@file-type/pdf')
        >,
      ]);

      return {
        parser: new fileTypeModule.FileTypeParser({
          customDetectors: [pdfModule.detectPdf],
        }),
        supportedMimeTypes: fileTypeModule.supportedMimeTypes,
      };
    })();

  fileTypeParserPromise = promise;

  return promise;
};
