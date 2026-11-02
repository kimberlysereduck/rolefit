import { jsPDF } from 'jspdf';

/**
 * Downloads formatted text content as a clean, professional, ATS-friendly PDF.
 */
export function downloadTextAsPdf(title: string, textContent: string, fileName: string) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Split lines
  const lines = textContent.split('\n');

  doc.setFont('helvetica', 'normal');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if we need a new page
    if (cursorY > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }

    if (!trimmed) {
      // Empty line -> spacing
      cursorY += 8;
      continue;
    }

    // Heading 1 (# or NAME)
    if (trimmed.startsWith('# ') || (i === 0 && !trimmed.startsWith('-') && !trimmed.startsWith('•'))) {
      const heading = trimmed.replace(/^#\s*/, '');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(heading, margin, cursorY);
      cursorY += 20;
      doc.setFont('helvetica', 'normal');
      continue;
    }

    // Heading 2 (## or SECTION TITLE)
    if (trimmed.startsWith('## ') || /^[A-Z\s]{4,}$/.test(trimmed)) {
      const heading = trimmed.replace(/^##\s*/, '');
      cursorY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(heading, margin, cursorY);
      cursorY += 3;
      // Underline rule for section
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.75);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 14;
      doc.setFont('helvetica', 'normal');
      continue;
    }

    // Heading 3 (### or Role / Subtitle)
    if (trimmed.startsWith('### ') || trimmed.startsWith('**') && trimmed.endsWith('**')) {
      const heading = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);
      doc.text(heading, margin, cursorY);
      cursorY += 14;
      doc.setFont('helvetica', 'normal');
      continue;
    }

    // Bullet points (- or * or •)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const bulletText = trimmed.replace(/^[-*•]\s*/, '');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      // Bullet dot
      doc.text('•', margin + 6, cursorY);

      // Wrapped bullet text
      const bulletWidth = contentWidth - 22;
      const wrapped = doc.splitTextToSize(bulletText, bulletWidth);
      doc.text(wrapped, margin + 18, cursorY);
      cursorY += wrapped.length * 12 + 4;
      continue;
    }

    // Standard body line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    const wrapped = doc.splitTextToSize(trimmed, contentWidth);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 12 + 3;
  }

  // Save the document
  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(safeName);
}
