'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadPgn } from "./actions";
import { useState, useEffect } from "react";
import { DefaultLayout } from "@/components/default-layout";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface FormValues {
  file: FileList;
}

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createFormSchema = () => {
    return z.object({
      file: z.instanceof(FileList)
        .refine(files => files.length > 0, {
          message: "Please select a file"
        })
        .refine(files => {
          const file = files[0];
          return file?.name?.endsWith('.pgn');
        }, {
          message: "File must be a PGN file"
        })
    });
  };

  const { 
    register, 
    handleSubmit: hookFormSubmit, 
    formState: { errors, isValid },
    reset 
  } = useForm<FormValues>({
    resolver: isMounted ? zodResolver(createFormSchema()) : undefined,
    mode: "onChange"
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!isMounted) return; 
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", data.file[0]); 
      
      const result = await uploadPgn(formData);
      setUploadStatus(result);
      
      if (result.success) {
        reset();
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        success: false, 
        message: 'An error occurred during upload'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DefaultLayout>
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl text-center">Upload Chess Game</CardTitle>
              <CardDescription className="text-center">
                Upload a PGN file to analyze your chess game
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-6">
                <div className="grid w-full items-center gap-2">
                  <label htmlFor="pgn-upload" className="text-sm font-medium">
                    PGN File
                  </label>
                  {isMounted ? (
                    <>
                      <Input
                        id="pgn-upload"
                        type="file"
                        accept=".pgn"
                        className={`cursor-pointer ${errors.file ? 'border-red-500' : ''}`}
                        {...register('file')}
                      />
                      
                      {errors.file && (
                        <p className="text-xs text-red-500">
                          {errors.file.message?.toString() || "Invalid file"}
                        </p>
                      )}
                    </>
                  ) : (
                    <Input
                      id="pgn-upload-placeholder"
                      type="file"
                      accept=".pgn"
                      disabled
                      className="cursor-pointer"
                    />
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Upload a PGN (Portable Game Notation) file containing your chess game
                  </p>
                </div>
                
                {uploadStatus && (
                  <div className={`text-sm rounded-md p-3 ${uploadStatus.success 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {uploadStatus.message}
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    disabled={!isMounted || !isValid || isUploading}
                    className="w-full sm:w-auto px-8"
                    size="lg"
                  >
                    {isUploading ? "Uploading..." : "Upload and Analyze"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </DefaultLayout>
  );
}
