import { useState } from "react";
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
    // Create a new window for printing
    const printContent = document.getElementById('print-preview');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selectedReptiles = reptiles.filter(r => selectedIds.has(r.id));
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Cartes de visite</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
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
              min-height: 297mm;
              padding: 10mm;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8mm;
              page-break-after: always;
            }
            
            .card {
              width: 85mm;
              height: 55mm;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 8mm;
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
              margin-bottom: 4mm;
            }
            
            .card-name {
              font-size: 14pt;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 2mm;
            }
            
            .card-species {
              font-size: 10pt;
              color: #666;
            }
            
            .qr-container {
              background: white;
              padding: 3mm;
              border-radius: 4px;
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
          ${generatePages(selectedReptiles)}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Generate QR codes after the document is ready
    setTimeout(() => {
      selectedReptiles.forEach((reptile, index) => {
        const qrUrl = `${window.location.origin}/reptile/${reptile.id}`;
        const qrElement = printWindow.document.getElementById(`qr-${index}`);
        if (qrElement) {
          const tempDiv = document.createElement('div');
          import('react-dom/client').then(({ createRoot }) => {
            const root = createRoot(tempDiv);
            root.render(<QRCodeSVG value={qrUrl} size={120} level="H" includeMargin={false} />);
            setTimeout(() => {
              const svg = tempDiv.querySelector('svg');
              if (svg && qrElement) {
                qrElement.innerHTML = svg.outerHTML;
              }
            }, 100);
          });
        }
      });

      // Print after QR codes are rendered
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }, 500);
  };

  const generatePages = (selectedReptiles: typeof reptiles) => {
    const cardsPerPage = 10;
    let pages = '';
    
    for (let i = 0; i < selectedReptiles.length; i += cardsPerPage) {
      const pageReptiles = selectedReptiles.slice(i, i + cardsPerPage);
      pages += `
        <div class="page">
          ${pageReptiles.map((reptile, idx) => generateCard(reptile, i + idx)).join('')}
        </div>
      `;
    }
    
    return pages;
  };

  const generateCard = (reptile: typeof reptiles[0], index: number) => {
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-name">${reptile.name}</div>
          <div class="card-species">${reptile.species}</div>
        </div>
        <div class="qr-container" id="qr-${index}">
          <!-- QR code will be inserted here -->
        </div>
      </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default PrintQRCodesDialog;
