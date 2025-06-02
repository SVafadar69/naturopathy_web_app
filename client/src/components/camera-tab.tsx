import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Upload, Images, Eye, FileText, Trash2 } from "lucide-react";
import type { Upload as UploadType } from "@shared/schema";

export default function CameraTab() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: uploads = [] } = useQuery<UploadType[]>({
    queryKey: ["/api/uploads"],
  });

  const imageUploads = uploads.filter(upload => upload.type === "image");

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      
      const response = await apiRequest("POST", "/api/uploads", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Image uploaded successfully",
        description: "AI analysis is in progress...",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const uploadToDocsMutation = useMutation({
    mutationFn: async (uploadId: number) => {
      const response = await apiRequest("POST", `/api/uploads/${uploadId}/upload-to-docs`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Uploaded to Google Docs",
        description: "Content has been successfully uploaded",
      });
    },
    onError: () => {
      toast({
        title: "Upload to Google Docs failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (uploadId: number) => {
      const response = await apiRequest("DELETE", `/api/uploads/${uploadId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Image deleted",
        description: "The image has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Camera Capture Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <Camera className="text-primary mr-2 h-5 w-5" />
          Medical Images
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" size="lg">
            <Camera className="mr-2 h-4 w-4" />
            Open Camera
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            size="lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Images className="mr-2 h-4 w-4" />
            Select from Gallery
          </Button>
        </div>
      </div>

      {/* File Upload Zone */}
      <div 
        className={`upload-zone bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver ? "border-primary bg-blue-50" : "border-neutral-300 hover:border-primary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
            <Upload className="h-8 w-8 text-neutral-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-neutral-800">Drop medical images here or click to browse</p>
            <p className="text-sm text-neutral-500 mt-1">Upload X-rays, lab results, skin conditions, or other medical imagery</p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
        </div>
      </div>

      {/* Recent Images */}
      {imageUploads.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Recent Images</h3>
          <div className="space-y-4">
            {imageUploads.map((upload) => (
              <Card key={upload.id} className="border border-neutral-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{upload.originalName}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(upload.createdAt!).toLocaleString()}
                        </p>
                        <Badge variant={upload.processed ? "default" : "secondary"} className="mt-1">
                          {upload.processed ? "Analyzed" : "Processing"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {upload.processed && !upload.uploadedToGoogleDocs && (
                        <Button
                          size="sm"
                          onClick={() => uploadToDocsMutation.mutate(upload.id)}
                          disabled={uploadToDocsMutation.isPending}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload to Docs
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(upload.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {upload.processed && upload.aiAnalysis && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center mb-2">
                        <Eye className="h-4 w-4 text-secondary mr-2" />
                        <span className="font-medium text-neutral-800">AI Analysis</span>
                      </div>
                      <p className="text-neutral-700 text-sm leading-relaxed">{upload.aiAnalysis}</p>
                    </div>
                  )}

                  {!upload.processed && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Processing...</span>
                        <span className="text-neutral-500">AI Analysis</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
