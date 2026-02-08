import JSZip from 'jszip';

interface EpubMetadata {
  title: string;
  author: string;
  language?: string;
  date?: string;
}

interface EpubChapter {
  title: string;
  content: string;
}

export async function generateEpub(
  metadata: EpubMetadata,
  chapters: EpubChapter[]
): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  // 3. OEBPS/content.opf (metadata and manifest)
  const contentOpf = generateContentOpf(metadata, chapters);
  zip.file('OEBPS/content.opf', contentOpf);

  // 4. OEBPS/toc.ncx (table of contents)
  const tocNcx = generateTocNcx(metadata, chapters);
  zip.file('OEBPS/toc.ncx', tocNcx);

  // 5. OEBPS/stylesheet.css
  const stylesheet = `
body {
  font-family: Georgia, serif;
  line-height: 1.6;
  margin: 2em;
}
h1, h2, h3 {
  font-family: Arial, sans-serif;
  color: #333;
}
p {
  text-indent: 1em;
  margin: 0.5em 0;
}
.chapter-title {
  text-align: center;
  margin: 2em 0;
  font-size: 1.5em;
}
`;
  zip.file('OEBPS/stylesheet.css', stylesheet);

  // 6. OEBPS/chapters/*.html
  chapters.forEach((chapter, index) => {
    const chapterHtml = generateChapterHtml(chapter);
    zip.file(`OEBPS/chapter${index + 1}.html`, chapterHtml);
  });

  // Generate blob
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

function generateContentOpf(metadata: EpubMetadata, chapters: EpubChapter[]): string {
  const { title, author, language = 'ko', date = new Date().toISOString().split('T')[0] } = metadata;
  const uuid = `urn:uuid:${generateUUID()}`;

  const manifestItems = chapters
    .map(
      (_, i) =>
        `    <item id="chapter${i + 1}" href="chapter${i + 1}.html" media-type="application/xhtml+xml"/>`
    )
    .join('\n');

  const spineItems = chapters
    .map((_, i) => `    <itemref idref="chapter${i + 1}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator opf:role="aut">${escapeXml(author)}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:date>${date}</dc:date>
    <dc:identifier id="BookId">${uuid}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="stylesheet" href="stylesheet.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`;
}

function generateTocNcx(metadata: EpubMetadata, chapters: EpubChapter[]): string {
  const { title, author } = metadata;
  const uuid = `urn:uuid:${generateUUID()}`;

  const navPoints = chapters
    .map(
      (chapter, i) => `
    <navPoint id="chapter${i + 1}" playOrder="${i + 1}">
      <navLabel>
        <text>${escapeXml(chapter.title)}</text>
      </navLabel>
      <content src="chapter${i + 1}.html"/>
    </navPoint>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${escapeXml(title)}</text>
  </docTitle>
  <docAuthor>
    <text>${escapeXml(author)}</text>
  </docAuthor>
  <navMap>${navPoints}
  </navMap>
</ncx>`;
}

function generateChapterHtml(chapter: EpubChapter): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" href="stylesheet.css" type="text/css"/>
</head>
<body>
  <h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
  <div class="chapter-content">
    ${chapter.content}
  </div>
</body>
</html>`;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadEpub(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.epub`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
