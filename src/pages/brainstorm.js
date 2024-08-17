import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { callOpenAI } from "@/utils/openai";
import { Lightbulb, Image, ArrowRightCircle, Trash2, Loader2, ZoomIn, ZoomOut } from 'lucide-react';

const BrainstormBoard = () => {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIdeaId, setLoadingIdeaId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const boardRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom(prevZoom => Math.min(Math.max(0.5, prevZoom - e.deltaY * 0.001), 2));
      }
    };

    const board = boardRef.current;
    board.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      board.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const startDragging = (e, ideaId) => {
    const element = e.target.closest('.idea-card');
    if (!element) return;

    const initialX = e.clientX - element.offsetLeft;
    const initialY = e.clientY - element.offsetTop;

    const onMouseMove = (moveEvent) => {
      const x = (moveEvent.clientX - initialX) / zoom;
      const y = (moveEvent.clientY - initialY) / zoom;
      
      setIdeas(prevIdeas => prevIdeas.map(idea => 
        idea.id === ideaId ? { ...idea, x, y } : idea
      ));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const addIdea = async (content) => {
    const newId = Date.now();
    const newIdeaObj = { id: newId, content, x: 50, y: 50 };
    setIdeas([...ideas, newIdeaObj]);
    setNewIdea('');
  };

  const generateImage = async (ideaId) => {
    setLoadingIdeaId(ideaId);
    try {
      const idea = ideas.find(i => i.id === ideaId);
      const imagePrompt = `Generate an image that represents the following idea: ${idea.content}`;
      const imageUrl = await callOpenAI(imagePrompt, 'image');
      setIdeas(ideas.map(i => 
        i.id === ideaId ? { ...i, imageUrl } : i
      ));
    } catch (error) {
      console.error("Error generating image:", error);
      alert(`Failed to generate image: ${error.message}`);
    } finally {
      setLoadingIdeaId(null);
    }
  };

  const expandIdea = async (ideaId) => {
    setLoadingIdeaId(ideaId);
    try {
      const idea = ideas.find(i => i.id === ideaId);
      const prompt = `Expand on this idea: ${idea.content}. Provide 3 related concepts or details.`;
      const expansion = await callOpenAI(prompt);
      const expandedIdeas = expansion.split('\n').filter(i => i.trim());
      const newIdeas = expandedIdeas.map((content, index) => ({
        id: Date.now() + index,
        content,
        x: idea.x + 250,
        y: idea.y + (index * 150)
      }));
      setIdeas([...ideas, ...newIdeas]);
    } catch (error) {
      console.error("Error expanding idea:", error);
      alert(`Failed to expand idea: ${error.message}`);
    } finally {
      setLoadingIdeaId(null);
    }
  };

  const improveIdea = async (ideaId) => {
    setLoadingIdeaId(ideaId);
    try {
      const idea = ideas.find(i => i.id === ideaId);
      const prompt = `Improve and refine this idea: ${idea.content}. Make it more specific and actionable.`;
      const improvedIdea = await callOpenAI(prompt);
      setIdeas(ideas.map(i => 
        i.id === ideaId ? { ...i, content: improvedIdea } : i
      ));
    } catch (error) {
      console.error("Error improving idea:", error);
      alert(`Failed to improve idea: ${error.message}`);
    } finally {
      setLoadingIdeaId(null);
    }
  };

  const deleteIdea = (ideaId) => {
    setIdeas(ideas.filter(idea => idea.id !== ideaId));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Brainstorm Board</h1>
      <div className="mb-4 flex space-x-2">
        <Input
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Enter a new idea..."
          className="flex-grow"
        />
        <Button onClick={() => addIdea(newIdea)} disabled={!newIdea.trim() || isLoading}>
          Add Idea
        </Button>
      </div>
      <div className="mb-4 flex space-x-2">
        <Button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>
          <ZoomOut className="h-4 w-4 mr-2" /> Zoom Out
        </Button>
        <Button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}>
          <ZoomIn className="h-4 w-4 mr-2" /> Zoom In
        </Button>
      </div>
      <div 
        ref={boardRef} 
        className="relative h-[800px] border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {ideas.map((idea) => (
          <Card 
            key={idea.id} 
            className="idea-card absolute cursor-move p-4 shadow-lg bg-white border-l-4 border-blue-500" 
            style={{ left: `${idea.x}px`, top: `${idea.y}px`, width: '300px' }}
            onMouseDown={(e) => startDragging(e, idea.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800 break-words">{idea.content}</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              {idea.imageUrl && <img src={idea.imageUrl} alt={idea.content} className="w-full h-auto mb-2 rounded" />}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => improveIdea(idea.id)} disabled={loadingIdeaId === idea.id}>
                      {loadingIdeaId === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Improve Idea</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => generateImage(idea.id)} disabled={loadingIdeaId === idea.id}>
                      {loadingIdeaId === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => expandIdea(idea.id)} disabled={loadingIdeaId === idea.id}>
                      {loadingIdeaId === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightCircle className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expand Idea</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => deleteIdea(idea.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Idea</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrainstormBoard;