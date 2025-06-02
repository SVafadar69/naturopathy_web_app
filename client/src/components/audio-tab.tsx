import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mic, Square, Upload, Play, Pause, Download, Trash2, FileAudio, Copy } from "lucide-react";
import AudioPlayer from "./audio-player";
import type { Upload as UploadType } from "@shared/schema";

export default function AudioTab() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: uploads = [] } = useQuery<UploadType[]>({
    queryKey: ["/api/uploads"],
  });

  const audioUploads = uploads.filter(upload => upload.type === "audio");

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "audio");
      
      const response = await apiRequest("POST", "/api/uploads", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Audio uploaded successfully",
        description: "Transcription is in progress...",
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
        description: "Transcription has been successfully uploaded",
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
        title: "Audio deleted",
        description: "The audio file has been removed",
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into the microphone",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      toast({
        title: "Recording stopped",
        description: "Audio is ready for upload",
      });
    }
  };

  const uploadRecording = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], "recording.wav", { type: "audio/wav" });
      uploadMutation.mutate(file);
      setRecordedBlob(null);
      setRecordingTime(0);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const file = files[0];
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 25MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Transcription has been copied",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Recording Section */}
      <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
          <Mic className="text-red-500 mr-2 h-5 w-5" />
          Audio Recording
        </h2>
        
        <div className="text-center space-y-4">
          <div 
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-all duration-300 ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <Square className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-neutral-800">
              {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
            </p>
            <p className="text-2xl font-bold text-neutral-800 mt-2">
              {formatTime(recordingTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Recorded Audio */}
      {recordedBlob && (
        <Card className="border border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-neutral-800">New Recording</h3>
              <div className="flex items-center space-x-2">
                <Button onClick={uploadRecording} disabled={uploadMutation.isPending}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload & Transcribe"}
                </Button>
              </div>
            </div>
            <AudioPlayer blob={recordedBlob} />
          </CardContent>
        </Card>
      )}

      {/* Audio Upload Zone */}
      <div className="bg-white border-2 border-dashed border-neutral-300 hover:border-accent rounded-xl p-8 text-center transition-all duration-300">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
            <FileAudio className="h-8 w-8 text-neutral-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-neutral-800">Upload audio files</p>
            <p className="text-sm text-neutral-500 mt-1">Support for MP3, WAV, M4A up to 25MB</p>
          </div>
          <Button 
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Audio Files
          </Button>
        </div>
      </div>

      {/* Audio Uploads */}
      {audioUploads.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">Audio Files</h3>
          <div className="space-y-4">
            {audioUploads.map((upload) => (
              <Card key={upload.id} className="border border-neutral-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileAudio className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{upload.originalName}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(upload.createdAt!).toLocaleString()}
                        </p>
                        <Badge variant={upload.processed ? "default" : "secondary"} className="mt-1">
                          {upload.processed ? "Transcribed" : "Processing"}
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

                  {upload.processed && upload.transcription && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-800">Transcription</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(upload.transcription!)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-neutral-700 text-sm leading-relaxed">{upload.transcription}</p>
                    </div>
                  )}

                  {!upload.processed && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Processing...</span>
                        <span className="text-neutral-500">Transcribing with Whisper</span>
                      </div>
                      <Progress value={65} className="h-2" />
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
