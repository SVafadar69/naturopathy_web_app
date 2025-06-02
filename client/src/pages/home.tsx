import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CameraTab from "@/components/camera-tab";
import AudioTab from "@/components/audio-tab";
import DocumentTab from "@/components/document-tab";
import { Camera, Mic, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Upload } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("documents");

  const { data: uploads = [], isLoading } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  const recentUploads = uploads.slice(0, 5);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-neutral-800">AI Content Capture</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-sm text-neutral-600">Connected</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <Card className="shadow-sm border border-neutral-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-100 p-1 rounded-none">
              <TabsTrigger 
                value="camera" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Camera className="h-4 w-4" />
                Camera & Images
              </TabsTrigger>
              <TabsTrigger 
                value="audio" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Mic className="h-4 w-4" />
                Audio Recording
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="m-0">
              <CameraTab />
            </TabsContent>

            <TabsContent value="audio" className="m-0">
              <AudioTab />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Google Docs Integration */}
        <Card className="mt-8 shadow-sm border border-neutral-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
              <i className="fab fa-google-drive text-blue-500 mr-2"></i>
              Google Docs Integration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connection Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">Ready for Upload</p>
                      <p className="text-sm text-neutral-500">Connect Google account to start</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </div>

              {/* Recent Uploads */}
              <div className="space-y-4">
                <h3 className="font-medium text-neutral-800">Recent Activity</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-sm text-neutral-500">Loading...</div>
                  ) : recentUploads.length === 0 ? (
                    <div className="text-sm text-neutral-500">No uploads yet</div>
                  ) : (
                    recentUploads.map((upload) => (
                      <div key={upload.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className={`fas ${upload.type === 'image' ? 'fa-image' : upload.type === 'audio' ? 'fa-volume-up' : 'fa-file-alt'} text-blue-500`}></i>
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{upload.originalName}</p>
                            <p className="text-xs text-neutral-500">
                              {new Date(upload.createdAt!).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={upload.processed ? "default" : "secondary"}>
                            {upload.processed ? "Processed" : "Processing"}
                          </Badge>
                          {upload.uploadedToGoogleDocs && upload.googleDocsUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={upload.googleDocsUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
