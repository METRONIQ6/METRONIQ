import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceViewer } from "@/components/ui/evidence-viewer";

export default function InspectionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center border-b pb-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inspection {params.id}</h1>
            <p className="text-slate-500 mt-1">Product: Lays Classic 50g • 2026-08-29</p>
         </div>
         <div className="flex space-x-3 items-center">
            <Badge className="bg-red-600 text-white hover:bg-red-600 px-3 py-1">NON-COMPLIANT</Badge>
            <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">HIGH RISK</Badge>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <EvidenceViewer />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
         <Button variant="outline">Escalate</Button>
         <Button className="bg-blue-600 hover:bg-blue-700">Issue Corrective Notice</Button>
      </div>
    </div>
  )
}