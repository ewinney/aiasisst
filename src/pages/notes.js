import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { callOpenAI } from "@/utils/openai";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveNote = () => {
    if (currentNote.title && currentNote.content) {
      setNotes([...notes, { ...currentNote, id: Date.now() }]);
      setCurrentNote({ title: "", content: "" });
    }
  };

  const handleAIAssist = async () => {
    setIsLoading(true);
    try {
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const prompt = `Based on the note title "${currentNote.title}" and content "${currentNote.content}", please provide:
1. A brief summary of the note (2-3 sentences)
2. A list of 3-5 action items derived from the note

Format the response as follows:
Summary:
[Your summary here]

Action Items:
- [Action item 1]
- [Action item 2]
- [Action item 3]
...`;

      const suggestion = await callOpenAI(prompt);
      setCurrentNote(prev => ({ 
        ...prev, 
        content: prev.content + "\n\n" + suggestion 
      }));
    } catch (error) {
      console.error("Error getting AI assistance:", error);
      alert(`Failed to get AI assistance: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Notes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create Note</h2>
          <Input
            placeholder="Note Title"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            className="mb-4"
          />
          <Textarea
            placeholder="Note Content"
            value={currentNote.content}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            className="mb-4"
            rows={10}
          />
          <div className="flex space-x-2">
            <Button onClick={handleSaveNote}>Save Note</Button>
            <Button variant="outline" onClick={handleAIAssist} disabled={isLoading || !currentNote.title || !currentNote.content}>
              {isLoading ? "Generating..." : "AI Assist"}
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Notes</h2>
          {notes.map((note) => (
            <Card key={note.id} className="mb-4">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}