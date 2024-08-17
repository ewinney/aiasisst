import { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { callOpenAI } from "@/utils/openai";
import { Lightbulb, Image, ArrowRightCircle, Trash2, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import StickyNote from '@/components/StickyNote';
import Connector from '@/components/Connector';
import Group from '@/components/Group';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const BrainstormBoard = () => {
  const [notes, setNotes] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isValidInput, setIsValidInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNoteId, setLoadingNoteId] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('isLoading:', isLoading);
  }, [isLoading]);

  // Removed useEffect for logging current notes state

  // Removed useEffect for logging current state

  const dispatch = useCallback((action) => {
    switch (action.type) {
      case 'ADD_NOTE':
        setNotes(prevNotes => [...prevNotes, action.payload]);
        break;
      case 'UPDATE_NOTE':
        setNotes(prevNotes => prevNotes.map(note =>
          note.id === action.payload.id ? { ...note, ...action.payload } : note
        ));
        break;
      case 'DELETE_NOTE':
        setNotes(prevNotes => prevNotes.filter(note => note.id !== action.payload.id));
        break;
      case 'ADD_CONNECTOR':
        setConnectors(prevConnectors => [...prevConnectors, action.payload]);
        break;
      case 'UPDATE_CONNECTOR':
        setConnectors(prevConnectors => prevConnectors.map(connector =>
          connector.id === action.payload.id ? { ...connector, ...action.payload } : connector
        ));
        break;
      case 'DELETE_CONNECTOR':
        setConnectors(prevConnectors => prevConnectors.filter(connector => connector.id !== action.payload.id));
        break;
      case 'ADD_GROUP':
        setGroups(prevGroups => [...prevGroups, action.payload]);
        break;
      case 'UPDATE_GROUP':
        setGroups(prevGroups => prevGroups.map(group =>
          group.id === action.payload.id ? { ...group, ...action.payload } : group
        ));
        break;
      case 'DELETE_GROUP':
        setGroups(prevGroups => prevGroups.filter(group => group.id !== action.payload.id));
        break;
      case 'BRING_TO_FRONT':
        setNotes(prevNotes => {
          const noteToUpdate = prevNotes.find(note => note.id === action.payload.id);
          const updatedNotes = prevNotes.filter(note => note.id !== action.payload.id);
          return [...updatedNotes, { ...noteToUpdate, zIndex: Math.max(...prevNotes.map(n => n.zIndex || 0)) + 1 }];
        });
        break;
      default:
        console.error('Unknown action type:', action.type);
    }
  }, []);

  const addIdea = async () => {
    console.log('Adding idea:', inputValue, 'isLoading:', isLoading, 'isValidInput:', isValidInput); // Enhanced debug log
    if (!inputValue.trim() || isLoading) {
      console.log('Aborting addIdea: Empty input or already loading');
      return;
    }
    setIsLoading(true);
    try {
      const newId = Date.now();
      const newNote = {
        id: newId,
        content: inputValue.trim(),
        position: { x: Math.random() * 500, y: Math.random() * 300 },
        type: 'note',
        zIndex: notes.length
      };

      console.log('Created new note object:', newNote); // Debug log

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      dispatch({
        type: 'ADD_NOTE',
        payload: newNote
      });

      console.log('New note added to state:', newNote); // Debug log

      // Reset input state after successfully adding the idea
      setInputValue('');
      setIsValidInput(false);
      console.log('Input state reset. New inputValue:', '', 'New isValidInput:', false); // Debug log
    } catch (error) {
      console.error('Error adding new idea:', error);
      alert('Failed to add new idea. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('Loading state reset. New isLoading:', false); // Debug log
    }
  };

  const generateImage = async (noteId) => {
    setLoadingNoteId(noteId);
    try {
      const note = notes.find(n => n.id === noteId);
      const imagePrompt = `Generate an image that represents the following idea: ${note.content}`;
      const imageUrl = await callOpenAI(imagePrompt, 'image');
      dispatch({ type: 'UPDATE_NOTE', payload: { id: noteId, imageUrl } });
    } catch (error) {
      console.error("Error generating image:", error);
      alert(`Failed to generate image: ${error.message}`);
    } finally {
      setLoadingNoteId(null);
    }
  };

  const expandIdea = async (noteId) => {
    setLoadingNoteId(noteId);
    try {
      const note = notes.find(n => n.id === noteId);
      const prompt = `Expand on this idea: ${note.content}. Provide 3 related concepts or details.`;
      const expansion = await callOpenAI(prompt);
      const expandedIdeas = expansion.split('\n').filter(i => i.trim());
      expandedIdeas.forEach((content, index) => {
        dispatch({
          type: 'ADD_NOTE',
          payload: {
            id: Date.now() + index,
            content,
            position: { x: note.position.x + 250, y: note.position.y + (index * 150) },
            type: 'note'
          }
        });
      });
    } catch (error) {
      console.error("Error expanding idea:", error);
      alert(`Failed to expand idea: ${error.message}`);
    } finally {
      setLoadingNoteId(null);
    }
  };

  const improveIdea = async (noteId) => {
    setLoadingNoteId(noteId);
    try {
      const note = notes.find(n => n.id === noteId);
      const prompt = `Improve and refine this idea: ${note.content}. Make it more specific and actionable.`;
      const improvedIdea = await callOpenAI(prompt);
      dispatch({ type: 'UPDATE_NOTE', payload: { id: noteId, content: improvedIdea } });
    } catch (error) {
      console.error("Error improving idea:", error);
      alert(`Failed to improve idea: ${error.message}`);
    } finally {
      setLoadingNoteId(null);
    }
  };

  const deleteIdea = (noteId) => {
    dispatch({ type: 'DELETE_NOTE', payload: { id: noteId } });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">AI Brainstorm Board</h1>
        <div className="mb-4 flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              const isValid = value.trim().length > 0;
              setIsValidInput(isValid);
              console.log('Input changed:', value, 'isValid:', isValid); // Debug log
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && isValidInput && !isLoading) {
                e.preventDefault(); // Prevent form submission
                addIdea();
              }
            }}
            placeholder="Enter a new idea..."
            className="flex-grow"
          />
          <Button
            onClick={addIdea}
            disabled={!isValidInput || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add Idea
          </Button>
        </div>
        <div className="mb-2">
          <p>Debug Info: Input: {inputValue}, IsValid: {isValidInput.toString()}, IsLoading: {isLoading.toString()}</p>
        </div>
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-4 left-4 z-10 flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => zoomIn()}
                  className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
                >
                  <ZoomIn className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => zoomOut()}
                  className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
                >
                  <ZoomOut className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => resetTransform()}
                  className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-md"
                >
                  Reset
                </motion.button>
              </div>
              <TransformComponent>
                <div ref={canvasRef} className="relative w-[3000px] h-[2000px] bg-white dark:bg-gray-900">
                  {groups.map(group => (
                    <Group
                      key={group.id}
                      id={group.id}
                      name={group.name}
                      noteIds={group.noteIds}
                      notes={notes}
                      dispatch={dispatch}
                    />
                  ))}
                  {connectors.map(connector => (
                    <Connector
                      key={connector.id}
                      id={connector.id}
                      start={notes.find(n => n.id === connector.startId)?.position}
                      end={notes.find(n => n.id === connector.endId)?.position}
                      style={connector.style}
                      label={connector.label}
                      onUpdate={(updatedConnector) => dispatch({ type: 'UPDATE_CONNECTOR', payload: updatedConnector })}
                    />
                  ))}
                  {notes.map(note => (
                    <StickyNote
                      key={note.id}
                      id={note.id}
                      content={note.content}
                      position={note.position}
                      imageUrl={note.imageUrl}
                      onMove={(id, position) => dispatch({ type: 'UPDATE_NOTE', payload: { id, position } })}
                      dispatch={dispatch}
                    >
                      <div className="flex justify-between pt-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => improveIdea(note.id)} disabled={loadingNoteId === note.id}>
                                {loadingNoteId === note.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
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
                              <Button size="sm" variant="outline" onClick={() => generateImage(note.id)} disabled={loadingNoteId === note.id}>
                                {loadingNoteId === note.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
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
                              <Button size="sm" variant="outline" onClick={() => expandIdea(note.id)} disabled={loadingNoteId === note.id}>
                                {loadingNoteId === note.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightCircle className="h-4 w-4" />}
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
                              <Button size="sm" variant="outline" onClick={() => deleteIdea(note.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Idea</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </StickyNote>
                  ))}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </DndProvider>
  );
};

export default BrainstormBoard;
