'use client'
import { useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import JsonTableWithChart from "./JsonTable";
import { Button } from "@/components/ui/button";

const FileSender = ({data,summary}) => {
  const [inputData, setInputData] = useState("");
  const [dataResp, setDataResp] = useState([]);

  const sendData = async () => {
    try {
      if(!inputData.trim() || !inputData || inputData.length === 0) return alert('No CSV Data Provided')
      // 1️⃣ Parse CSV into JSON
      const parsed = Papa.parse(inputData.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        console.error("CSV parse errors:", parsed.errors);
        alert("Invalid CSV format!");
        return;
      }

      const jsonData = parsed.data;
      // console.log("✅ Parsed CSV → JSON:", jsonData);

      // 2️⃣ Send JSON to Flask
      const resp = await axios.post(`/api/file/sendrawdata`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });

      // console.log("✅ Server Response:", resp.data);
      setDataResp(resp.data.data?.cleaned_data || []);
      data(resp.data.data?.cleaned_data || [])
      summary(resp?.data?.data)
    } catch (error) {
      console.error("❌ Server error:", error);
      alert("Error sending data. Check console.");
    }
  };
  const sendCleanData = async () => {
    try {
       if(!inputData.trim() || !inputData || inputData.length === 0) return alert('No CSV Data Provided')
      // 1️⃣ Parse CSV into JSON
      const parsed = Papa.parse(inputData.trim(), {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        console.error("CSV parse errors:", parsed.errors);
        alert("Invalid CSV format!");
        return;
      }

      const jsonData = parsed.data;
      // console.log("✅ Parsed CSV → JSON:", jsonData);

      // 2️⃣ Send JSON to Flask
      const resp = await axios.post(`/api/file/cleanrawdata`, jsonData, {
        headers: { "Content-Type": "application/json" },
      });

      // console.log("✅ Server Response:", resp.data);
      setDataResp(resp.data.data?.cleaned_data || []);
      data(resp.data.data?.cleaned_data || [])
      summary(resp?.data?.data)
    } catch (error) {
      console.error("❌ Server error:", error);
      alert("Error sending data. Check console.");
    }
  };

  return (
    <div>
      <h3>📄 Paste CSV data below</h3>
      <textarea
        rows="10"
        className="w-[80%] mx-3"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Paste CSV data (with headers) here"
   
      />
      <br />
      <Button onClick={sendData}>Send Data</Button>
      <Button onClick={sendCleanData}>Clean Data</Button>
      {/* <pre>{JSON.stringify(dataResp, null, 2)}</pre> */}
      {/* <JsonTableWithChart data={dataResp} /> */}
    </div>
  );
};

export default FileSender;
