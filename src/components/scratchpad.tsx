
'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Save, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Scratchpad() {
  const [notes, setNotes] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    const savedNotes = localStorage.getItem('scratchpadNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('scratchpadNotes', notes);
    toast({
      title: 'Notes Saved!',
      description: 'Your quick notes have been saved locally.',
    });
  };

  const handleClear = () => {
    setNotes('');
    localStorage.removeItem('scratchpadNotes');
     toast({
      title: 'Notes Cleared!',
      variant: 'destructive'
    });
  }

  return (
    <Card className="w-full animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scratchpad</CardTitle>
            <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                    <Save className="mr-2"/>
                    Save Notes
                </Button>
                 <Button onClick={handleClear} variant="destructive" size="sm">
                    <Trash className="mr-2"/>
                    Clear
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Jot down your quick thoughts, ideas, or temporary notes here... This is saved in your browser and won't be synced."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[400px] text-base"
        />
      </CardContent>
    </Card>
  );
}
