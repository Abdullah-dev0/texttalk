import { currentUser } from '@clerk/nextjs/server';
import { Document } from '@langchain/core/documents';
import { PineconeStore } from '@langchain/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { CanvasFactory } from 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { db } from '@/db';
import { embeddings } from '@/lib/embeddings';
import index from '@/lib/pinecone';

const f = createUploadthing();

export const ourFileRouter: FileRouter = {
  FileUploader: f({ pdf: { maxFileSize: '8MB' } })
    .middleware(async () => {
      const user = await currentUser();

      if (!user || !user.id) throw new UploadThingError('No user ID');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.ufsUrl,
          uploadStatus: 'PROCESSING',
        },
      });

      try {
        const response = await fetch(file.ufsUrl);
        if (!response.ok) {
          throw new Error(`Failed to download PDF: ${response.status}`);
        }

        const parser = new PDFParse({
          data: new Uint8Array(await response.arrayBuffer()),
          CanvasFactory,
        });
        const parsedPdf = await parser
          .getText()
          .finally(async () => parser.destroy());

        const pageLevelDocs = parsedPdf.pages.map(
          (page) =>
            new Document({
              pageContent: page.text,
              metadata: { loc: { pageNumber: page.num } },
            })
        );

        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 2000,
          chunkOverlap: 100,
          separators: ['\n\n', '\n', '. ', ' ', ''],
        });

        const splitDocs = await splitter.splitDocuments(pageLevelDocs);

        const pageLevelDocsWithId = splitDocs.map((doc) => ({
          pageContent: doc.pageContent,
          metadata: {
            fileId: createdFile.id,
            pageNumber: doc.metadata.loc?.pageNumber,
          },
        }));

        await PineconeStore.fromDocuments(pageLevelDocsWithId, embeddings, {
          pineconeIndex: index,
          namespace: createdFile.id,
        });

        await db.file.update({
          data: {
            uploadStatus: 'SUCCESS',
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (error) {
        console.error('PDF processing failed:', error);

        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

