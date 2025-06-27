import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Image, Plus } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";

export default function Photos() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Photos</h1>
            <p className="text-slate-600">
              Manage product photos and customer references
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Photo Management Coming Soon
            </h3>
            <p className="text-slate-600 mb-6">
              Upload and organize photos for your t-shirt designs and customer
              references. This feature will be available in the next update.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Design
              </Button>
              <Button variant="outline">
                <Image className="h-4 w-4 mr-2" />
                View Gallery
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
