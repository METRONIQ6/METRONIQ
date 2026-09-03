import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RuleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto">
      <div className="border-b pb-4">
        <div className="flex justify-between items-start">
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">{params.id}</h1>
             <p className="text-lg text-slate-700 mt-1">MRP Declaration Required</p>
           </div>
           <Badge variant="default" className="bg-emerald-500">ACTIVE</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="space-y-6">
            <Card>
               <CardHeader>
                  <CardTitle>Rule Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold block">Current Version</span>
                    <span>v4.0</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold block">Category</span>
                    <span>Global Default</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-500 font-bold block">Validation Logic Block</span>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-md text-xs mt-1 overflow-x-auto">
{`{
  "target_field": "mrp",
  "operator": "EXISTS",
  "AND": {
    "target_field": "mrp",
    "matches_format": "^(Rs|₹)\s*\d+(\.\d{1,2})?"
  }
}`}
                    </pre>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="border-blue-200 shadow-blue-50">
               <CardHeader className="bg-blue-50/50">
                  <CardTitle className="text-blue-900">Rule Simulator</CardTitle>
                  <CardDescription>Test this exact rule logic against mock extracted data.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mock CV Output for `mrp`:</label>
                    <Input defaultValue="₹ 50.00" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Execute Simulation</Button>
                  
                  <div className="mt-4 p-4 border rounded-md border-emerald-200 bg-emerald-50 flex items-center justify-between">
                     <div>
                       <span className="text-xs text-emerald-800 uppercase block font-bold">Simulation Result</span>
                       <span className="font-medium text-emerald-900">Validation Passed</span>
                     </div>
                     <Badge className="bg-emerald-600">PASS</Badge>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}