import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { callOpenAI } from "@/utils/openai";

export default function AITools() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [documentInput, setDocumentInput] = useState("");
  const [emailInput, setEmailInput] = useState({ subject: "", content: "", tone: "professional" });
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if API key is set
    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
      setError('OpenAI API key not found. Please set it in the settings.');
    }
  }, []);

  const handleSendMessage = async (message) => {
    setIsLoading(true);
    setError(null);
    const newMessages = [...chatMessages, { role: "user", content: message }];
    setChatMessages(newMessages);
    setChatInput("");

    try {
      const response = await callOpenAI(message);
      setChatMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error calling AI:", error);
      setError(error.message || "An error occurred while processing your request.");
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again or check your API key in settings." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDocument = async () => {
    setIsLoading(true);
    try {
      const prompt = `Please analyze the following document and provide a summary, key points, and any notable insights:

${documentInput}

Format your response as follows:
Summary:
[2-3 sentence summary]

Key Points:
- [Key point 1]
- [Key point 2]
- [Key point 3]

Insights:
- [Insight 1]
- [Insight 2]`;

      const response = await callOpenAI(prompt);
      setResult(response);
    } catch (error) {
      console.error("Error analyzing document:", error);
      setResult("An error occurred while analyzing the document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteEmail = async () => {
    setIsLoading(true);
    try {
      const prompt = `Write a ${emailInput.tone} email with the following subject and content:

Subject: ${emailInput.subject}

Content: ${emailInput.content}

Please format the email appropriately and expand on the content while maintaining the intended tone.`;

      const response = await callOpenAI(prompt);
      setResult(response);
    } catch (error) {
      console.error("Error writing email:", error);
      setResult("An error occurred while writing the email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-center">AI Tools</h1>
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="document">Document Analysis</TabsTrigger>
          <TabsTrigger value="email">Email Writing</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[50vh] mb-4 p-4 border rounded-md">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === "assistant" ? "text-blue-600" : "text-green-600"}`}>
                    <strong>{message.role === "assistant" ? "AI: " : "You: "}</strong>
                    {message.content}
                  </div>
                ))}
                {error && <div className="text-red-500 mb-4">{error}</div>}
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage(chatInput)}
                />
                <Button onClick={() => handleSendMessage(chatInput)} disabled={isLoading || !chatInput.trim()}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your document here..."
                value={documentInput}
                onChange={(e) => setDocumentInput(e.target.value)}
                className="mb-4"
                rows={10}
              />
              <Button onClick={handleAnalyzeDocument} disabled={isLoading || !documentInput.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Document"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Writing Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Email Subject"
                value={emailInput.subject}
                onChange={(e) => setEmailInput({ ...emailInput, subject: e.target.value })}
                className="mb-4"
              />
              <Textarea
                placeholder="Email Content"
                value={emailInput.content}
                onChange={(e) => setEmailInput({ ...emailInput, content: e.target.value })}
                className="mb-4"
                rows={5}
              />
              <select
                value={emailInput.tone}
                onChange={(e) => setEmailInput({ ...emailInput, tone: e.target.value })}
                className="w-full p-2 mb-4 border rounded-md"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
              <Button onClick={handleWriteEmail} disabled={isLoading || !emailInput.subject.trim() || !emailInput.content.trim()}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Write Email"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[30vh]">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}