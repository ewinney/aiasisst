import { useState, useRef, useEffect, useMemo } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, ChevronsDownUp } from 'lucide-react';
import 'react-resizable/css/styles.css';
import { debounce } from 'lodash';

const colors = ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200', 'bg-purple-200'];

export default function StickyNote({ id, content, position, imageUrl, onMove, canvasRef, dispatch, children, zIndex }) {
  const [noteContent, setNoteContent] = useState(content);
  const [color, setColor] = useState(colors[0]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [size, setSize] = useState({ width: 200, height: 200 });
  const [isResizing, setIsResizing] = useState(false);
  const noteRef = useRef(null);

  useEffect(() => {
    if (position.x !== undefined && position.y !== undefined && size.width && size.height) {
      dispatch({ type: 'UPDATE_NOTE', payload: { id, position, size } });
    }
  }, [dispatch, id, position.x, position.y, size.width, size.height]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_NOTE', payload: { id, content } });
  }, [dispatch, id, content]);

  const handleDrag = (e, data) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { id, position: { x: data.x, y: data.y } } });
    dispatch({ type: 'BRING_TO_FRONT', payload: { id } });
  };

  const handleResize = (event, { size }) => {
    setSize(size);
    dispatch({ type: 'UPDATE_NOTE', payload: { id, size } });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNoteContent(newContent);
    dispatch({ type: 'UPDATE_NOTE', payload: { id, content: newContent } });
  };





  const handleColorChange = (newColor) => {
    setColor(newColor);
    dispatch({ type: 'UPDATE_NOTE', payload: { id, color: newColor } });
  };

  const handleAddLink = () => {
    if (linkUrl) {
      dispatch({ type: 'UPDATE_NOTE', payload: { id, link: linkUrl } });
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  return (
    <Draggable
      handle=".handle"
      position={position}
      onStop={handleDrag}
      bounds="parent"
      onMouseDown={() => dispatch({ type: 'BRING_TO_FRONT', payload: { id } })}
      grid={[5, 5]} // Finer grid for smoother movement
      defaultClassName="transition-transform duration-150 ease-in-out" // Smooth transition during drag
    >
      <div ref={noteRef} style={{ zIndex: zIndex || 'auto' }}>
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[150, 150]}
          maxConstraints={[400, 400]}
          onResize={handleResize}
          onResizeStart={() => setIsResizing(true)}
          onResizeStop={() => setIsResizing(false)}
          resizeHandles={['se']}
          handle={
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 rounded-br flex items-center justify-center">
              <ChevronsDownUp className="w-3 h-3 text-gray-600" />
            </div>
          }
        >
          <Card className={`p-2 ${color} shadow-lg ${isResizing ? 'pointer-events-none' : ''} transition-shadow duration-200`}>
            <div className="handle cursor-move h-6 bg-gray-200 rounded-t mb-2" />
            <Textarea
              value={noteContent}
              onChange={handleContentChange}
              className="w-full resize-none bg-transparent border-none focus:ring-0 transition-all duration-200"
              style={{ height: `${size.height - 100}px` }} // Adjusted height to accommodate button container
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex space-x-1">
                {colors.map((c) => (
                  <div
                    key={c}
                    className={`w-4 h-4 rounded-full cursor-pointer ${c} hover:scale-110 transition-transform duration-150`}
                    onClick={() => handleColorChange(c)}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="hover:bg-opacity-20 transition-colors duration-150"
                >
                  <Link className="h-4 w-4" />
                </Button>
                {children}
              </div>
            </div>
            {showLinkInput && (
              <div className="mt-2 bg-white p-2 rounded shadow transition-all duration-200">
                <Input
                  type="url"
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mb-2 transition-all duration-150"
                />
                <Button size="sm" onClick={handleAddLink} className="hover:bg-opacity-90 transition-colors duration-150">Add Link</Button>
              </div>
            )}
          </Card>
        </ResizableBox>
      </div>
    </Draggable>
  );
}
