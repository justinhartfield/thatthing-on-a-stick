import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { Streamdown } from "streamdown";

interface ToolkitViewerProps {
  markdown: string;
  projectName: string;
}

export function ToolkitViewer({ markdown, projectName }: ToolkitViewerProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_Brand_Toolkit.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-2xl">Brand Toolkit</CardTitle>
              <CardDescription>Complete brand style guide for {projectName}</CardDescription>
            </div>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download Markdown
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <Streamdown>{markdown}</Streamdown>
        </div>
      </CardContent>
    </Card>
  );
}
