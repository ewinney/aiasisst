import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    // Load the API key from localStorage when the component mounts
    const savedApiKey = localStorage.getItem("openaiApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("openaiApiKey", apiKey);
    alert("API key saved successfully!");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSaveApiKey}>Save API Key</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;