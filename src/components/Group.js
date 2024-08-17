import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export default function Group({ id, name, noteIds, notes, dispatch }) {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(name);

  const [{ isDragging }, drag] = useDrag({
    type: 'group',
    item: { id, type: 'group' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const groupNotes = notes.filter(note => noteIds.includes(note.id));
  const groupBounds = calculateGroupBounds(groupNotes);

  function calculateGroupBounds(notes) {
    if (notes.length === 0) return { x: 0, y: 0, width: 200, height: 200 };

    const x = Math.min(...notes.map(n => n.position.x));
    const y = Math.min(...notes.map(n => n.position.y));
    const maxX = Math.max(...notes.map(n => n.position.x + (n.size?.width || 200)));
    const maxY = Math.max(...notes.map(n => n.position.y + (n.size?.height || 200)));

    return {
      x: x - 10,
      y: y - 30,
      width: maxX - x + 20,
      height: maxY - y + 40,
    };
  }

  const handleNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleNameSubmit = () => {
    dispatch({ type: 'UPDATE_GROUP', payload: { id, name: groupName } });
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_GROUP', payload: { id } });
  };

  return (
    <Card
      ref={drag}
      style={{
        position: 'absolute',
        left: groupBounds.x,
        top: groupBounds.y,
        width: groupBounds.width,
        height: groupBounds.height,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: 'rgba(200, 200, 200, 0.2)',
        border: '2px dashed #888',
      }}
      className="cursor-move"
    >
      <div className="font-bold p-1 bg-white dark:bg-gray-800 rounded-t flex justify-between items-center">
        {isEditing ? (
          <Input
            value={groupName}
            onChange={handleNameChange}
            onBlur={handleNameSubmit}
            className="w-full"
          />
        ) : (
          <>
            <span>{name}</span>
            <div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
