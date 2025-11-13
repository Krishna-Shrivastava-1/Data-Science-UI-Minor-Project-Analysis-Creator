'use client'
import { useState, useEffect } from "react"; // 🆕 Import useEffect
import axios from "axios";
import Papa from "papaparse";
// import JsonTableWithChart from "./JsonTable"; // Keep if needed, removed for brevity
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
// 🆕 Assuming you have a Progress component (e.g., from Shadcn/ui)
import { Progress } from "@/components/ui/progress"; 

const FileSender = ({data,summary}) => {
  const [inputData, setInputData] = useState("");
  const [dataResp, setDataResp] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  // 🆕 State for progress bar value
  const [progress, setProgress] = useState(0); 

  // 🆕 Effect to simulate progress when loading starts
  useEffect(() => {
    if (isLoading) {
      // Start increasing progress
      const interval = setInterval(() => {
        setProgress(oldProgress => {
          // Stop simulated progress just before 95%
          if (oldProgress >= 95) {
            clearInterval(interval);
            return 95;
          }
          // Increment progress faster at the start, slower near the end
          const diff = Math.random() * 10; 
          return Math.min(oldProgress + diff, 95);
        });
      }, 500); // Update every half second

      // Clean up the interval when the component unmounts or isLoading changes
      return () => clearInterval(interval);
    } else {
      // Reset progress when loading is complete
      setProgress(0); 
    }
  }, [isLoading]);

  // Function to handle the API call logic
  const handleApiCall = async (endpoint) => {
    // Check if loading or if data is empty early
    if(isLoading) return; 
    if(!inputData.trim() || !inputData || inputData.length === 0) {
      toast.error('No CSV Data Provided');
      return;
    }
    
    setIsLoading(true);
    setProgress(10); // Start progress immediately

    try {
      // 1️⃣ Parse CSV into JSON
      const parsed = Papa.parse(inputData.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        console.error("CSV parse errors:", parsed.errors);
        toast.info("Invalid CSV format!");
        return;
      }

      const jsonData = parsed.data;
      
      // 2️⃣ Send JSON to API
      const resp = await axios.post(endpoint, jsonData, {
        headers: { "Content-Type": "application/json" },
      });

      setDataResp(resp.data.data?.cleaned_data || []);
      data(resp.data.data?.cleaned_data || [])
      summary(resp?.data?.data)
      
      // Complete the progress visually
      setProgress(100); 

    } catch (error) {
      console.error("❌ Server error:", error);
      toast.error("Error sending data. Check console.");
    } finally {
      // Use a timeout to briefly show 100% completion before resetting
      setTimeout(() => {
        setIsLoading(false); 
      }, 500); // 0.5 second delay after completion/error
    }
  }

  const sendData = () => handleApiCall(`/api/file/sendrawdata`);
  const sendCleanData = () => handleApiCall(`/api/file/cleanrawdata`);

  return (
    <div>
      <h3>📄 Paste CSV data below</h3>
   
      {/* 🆕 Progress Bar */}
     

      {isLoading && (
         <div className="min-h-screen w-full bg-black/30 backdrop-blur-xs  z-40 flex items-center justify-center fixed top-0 left-0">
         <div className="w-[50%]">
           <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-1">
            {progress < 100 ? "Processing data..." : "Complete!"}
          </p>
         </div>
        </div>
      )}
    
      
      <Textarea  
        rows="10"
        className="w-[80%] mx-3 max-h-[170px] overflow-y-scroll"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)} 
        placeholder="Paste CSV data (with headers) here" 
        // 🆕 Textarea is disabled while loading
        disabled={isLoading}
      />
      <br />
      {/* 🆕 Buttons are disabled to prevent re-submission while loading */}
      <Button onClick={sendData} disabled={isLoading} className="mr-2">
        Send Data
      </Button>
      <Button onClick={sendCleanData} disabled={isLoading}>
        Clean Data
      </Button>
    </div>
  );
};

export default FileSender;