import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Nfc } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrintQRCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: Array<{
    id: string;
    name: string;
    species: string;
    category: string;
  }>;
}

const PrintQRCodesDialog = ({ open, onOpenChange, reptiles }: PrintQRCodesDialogProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectAll = () => {
    setSelectedIds(new Set(reptiles.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handlePrint = () => {
    if (!qrContainerRef.current) return;

    const selectedReptiles = reptiles.filter(r => selectedIds.has(r.id));
    if (selectedReptiles.length === 0) return;

    // Wait for QR codes to render
    setTimeout(() => {
      const qrElements = qrContainerRef.current?.querySelectorAll('.qr-code-item');
      if (!qrElements || qrElements.length === 0) return;

      // Extract SVG strings from rendered QR codes
      const qrSvgs: string[] = [];
      qrElements.forEach(element => {
        const svg = element.querySelector('svg');
        if (svg) {
          qrSvgs.push(svg.outerHTML);
        }
      });

      // Generate print HTML with actual SVG content
      const html = generatePrintHTML(selectedReptiles, qrSvgs);

      // Open print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(html);
      printWindow.document.close();

      // Print after content loads
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }, 300);
  };

  const generatePrintHTML = (selectedReptiles: typeof reptiles, qrSvgs: string[]) => {
    const cardsPerPage = 10;
    let pagesHTML = '';
    
    for (let i = 0; i < selectedReptiles.length; i += cardsPerPage) {
      const pageReptiles = selectedReptiles.slice(i, i + cardsPerPage);
      const pageCards = pageReptiles.map((reptile, idx) => {
        const globalIdx = i + idx;
        return `
          <div class="card">
            <div class="card-header">
              <div class="card-name">${reptile.name}</div>
              <div class="card-species">${reptile.species}</div>
            </div>
            <div class="card-content">
              <div class="qr-section">
                <div class="section-label">QR Code</div>
                <div class="qr-container">
                  ${qrSvgs[globalIdx] || ''}
                </div>
              </div>
              <div class="nfc-section">
                <div class="section-label">Zone NFC</div>
                <div class="nfc-zone">
                  <svg class="nfc-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"></path>
                    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"></path>
                    <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"></path>
                    <path d="M16.37 2a20.16 20.16 0 0 1 0 20"></path>
                  </svg>
                  <div class="nfc-text">Collez le tag NFC ici</div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="card-id">ID: ${reptile.id.substring(0, 8)}</div>
            </div>
          </div>
        `;
      }).join('');
      
      pagesHTML += `<div class="page">${pageCards}</div>`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Étiquettes Hybrides - QR Code & NFC</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: white;
            }
            
            .page {
              width: 210mm;
              height: 297mm;
              padding-top: 21.5mm;
              padding-bottom: 21.5mm;
              padding-left: 12.7mm;
              padding-right: 12.7mm;
              display: grid;
              grid-template-columns: repeat(2, 85mm);
              grid-template-rows: repeat(5, 54mm);
              column-gap: 2.5mm;
              row-gap: 0mm;
              page-break-after: always;
            }
            
            .card {
              width: 85mm;
              height: 54mm;
              border: 2px solid #333;
              border-radius: 0;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            
            .card-header {
              text-align: center;
              margin-bottom: 2mm;
              border-bottom: 1px solid #ddd;
              padding-bottom: 2mm;
            }
            
            .card-name {
              font-size: 11pt;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 1mm;
              line-height: 1.2;
            }
            
            .card-species {
              font-size: 8pt;
              color: #666;
              font-style: italic;
            }
            
            .card-content {
              flex: 1;
              display: flex;
              gap: 2mm;
            }
            
            .qr-section,
            .nfc-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            
            .section-label {
              font-size: 7pt;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin-bottom: 1mm;
            }
            
            .qr-container {
              display: flex;
              align-items: center;
              justify-content: center;
              flex: 1;
              background: white;
              padding: 1mm;
              border: 1px solid #e0e0e0;
            }
            
            .qr-container svg {
              width: 120px !important;
              height: 120px !important;
              display: block;
            }
            
            .nfc-section {
              border-left: 1px dashed #ccc;
              padding-left: 2mm;
            }
            
            .nfc-zone {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px dashed #999;
              border-radius: 3px;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 2mm;
              width: 100%;
            }
            
            .nfc-icon {
              color: #666;
              width: 36px;
              height: 36px;
              margin-bottom: 1mm;
            }
            
            .nfc-text {
              font-size: 7pt;
              color: #666;
              text-align: center;
              font-weight: 500;
            }
            
            .card-footer {
              text-align: center;
              margin-top: 2mm;
              padding-top: 1mm;
              border-top: 1px solid #eee;
            }
            
            .card-id {
              font-size: 6pt;
              color: #999;
              font-family: monospace;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .page:last-child {
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          ${pagesHTML}
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Imprimer les étiquettes hybrides (QR Code + NFC)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les reptiles pour générer des étiquettes avec QR code et zone NFC
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Tout désélectionner
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-4">
            <div className="space-y-3">
              {reptiles.map((reptile) => (
                <div
                  key={reptile.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => toggleSelection(reptile.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(reptile.id)}
                    onCheckedChange={() => toggleSelection(reptile.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{reptile.name}</p>
                    <p className="text-sm text-muted-foreground">{reptile.species}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedIds.size} reptile(s) sélectionné(s)
            </p>
            <Button
              onClick={handlePrint}
              disabled={selectedIds.size === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer ({selectedIds.size})
            </Button>
          </div>
        </div>

        {/* Hidden container for QR code generation */}
        <div ref={qrContainerRef} className="hidden">
          {reptiles.filter(r => selectedIds.has(r.id)).map((reptile) => (
            <div key={reptile.id} className="qr-code-item">
              <QRCodeSVG
                value={reptile.id}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintQRCodesDialog;
