import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { demoRules } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RulesDashboard() {
  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Rule Control Dashboard</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage versioned legal rules for the deterministic compliance engine.</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 w-fit">Admin Only • DEMO DATA</Badge>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full sm:max-w-md">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
           <Input placeholder="Search rule ID, name or category..." className="pl-9 h-10" />
        </div>
        <Button className="w-full sm:w-auto h-10">Create Rule</Button>
      </div>

      {/* Mobile Rules View - Stacked Cards */}
      <div className="md:hidden space-y-4">
         {demoRules.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="text-xs font-mono text-slate-500 mb-0.5">{r.id}</div>
                       <div className="font-bold text-slate-900 border-b pb-1 mb-1">{r.name}</div>
                       <div className="text-xs text-slate-600">{r.category}</div>
                    </div>
                    <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'} className={r.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : ''}>
                      {r.status}
                    </Badge>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <Badge variant="outline" className="text-xs py-0">v{r.version}</Badge>
                    <Link href={`/rules/${r.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-900 h-8 px-4">
                      Simulator
                    </Link>
                 </div>
              </CardContent>
            </Card>
         ))}
      </div>

      {/* Desktop Rules View - Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Active & Draft Rules</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule ID</TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoRules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{r.name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.category}</TableCell>
                    <TableCell>
                       <Badge variant="outline">v{r.version}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={r.status === 'ACTIVE' ? 'default' : 'secondary'} className={r.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-200 text-slate-700'}>
                        {r.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/rules/${r.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 h-8 px-3">
                        Simulator
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}