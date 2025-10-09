import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer } from "lucide-react";
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
            <div class="qr-container">
              ${qrSvgs[globalIdx] || ''}
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
          <title>QR Codes - Cartes de visite</title>
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
              border: 1px solid #e0e0e0;
              border-radius: 0;
              padding: 4mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            
            .card-header {
              text-align: center;
              margin-bottom: 2mm;
            }
            
            .card-name {
              font-size: 12pt;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 1mm;
            }
            
            .card-species {
              font-size: 9pt;
              color: #666;
            }
            
            .qr-container {
              background: white;
              padding: 2mm;
              border-radius: 4px;
            }

            .qr-container svg {
              width: 90px;
              height: 90px;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
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
          <DialogTitle>Imprimer les QR codes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les reptiles dont vous voulez imprimer les QR codes
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

          <ScrollArea className="h-[400px] border rounded-md p-4">
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
                value={`${window.location.origin}/reptile/${reptile.id}`}
                size={90}
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
