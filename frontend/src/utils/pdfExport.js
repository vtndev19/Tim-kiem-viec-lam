import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportCVToPdf(element, fileName = "cv") {
  if (!element) throw new Error("Preview element not found");
  const scale = 2;
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    scrollY: -window.scrollY,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${fileName}.pdf`);
}
