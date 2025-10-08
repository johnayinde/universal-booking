// src/utils/pdfUtils.js

/**
 * Generates and downloads a PDF from a DOM element
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The name of the PDF file (without extension)
 * @param {Object} options - Additional options
 * @param {number} options.scale - Scale factor for canvas (default: 2)
 * @param {number} options.margin - Margin in mm (default: 10)
 * @param {string} options.orientation - 'p' for portrait or 'l' for landscape (default: 'p')
 * @param {string} options.format - Page format like 'a4', 'letter' (default: 'a4')
 */
export const generatePdfFromElement = async (
  element,
  filename = `document-${Date.now()}`,
  options = {}
) => {
  const {
    scale = 2,
    margin = 10,
    orientation = "p",
    format = "a4",
    backgroundColor = "#ffffff",
  } = options;

  try {
    // Dynamic imports
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    if (!element) {
      throw new Error("Element not found for PDF generation");
    }

    // Generate canvas from element
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF(orientation, "mm", format);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(`${filename}.pdf`);

    return { success: true };
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};

/**
 * Hook to use PDF download functionality in React components
 * @returns {Object} Object containing downloadPdf function and loading state
 */
export const usePdfDownload = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState(null);

  const downloadPdf = async (element, filename, options) => {
    setIsGenerating(true);
    setError(null);

    try {
      await generatePdfFromElement(element, filename, options);
    } catch (err) {
      setError(err.message);
      alert(
        "Failed to generate PDF. Please try using your browser's print function."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadPdf, isGenerating, error };
};
