'use client';

import { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';

import type { Task } from '@/lib/types';
import { analyzeFocus } from '@/ai/flows/analyze-focus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FocusCoachProps {
  tasks: Task[];
}

interface AnalysisResult {
    analysis: string;
    keyTakeaways: string[];
}

export function FocusCoach({ tasks }: FocusCoachProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setLoading(true);
    setResult(null);
    try {
      const completedTasks = tasks.filter(t => t.completed);
      if (completedTasks.length < 3) {
        toast({
            variant: 'default',
            title: 'Not Enough Data',
            description: 'Complete at least 3 tasks to get a productivity analysis.',
        });
        return;
      }
      const analysisResult = await analyzeFocus(tasks);
      if (analysisResult) {
        setResult(analysisResult);
      }
    } catch (error) {
      console.error('Failed to get focus analysis:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem getting your analysis. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-accent" />
            <CardTitle className="font-headline">AI Focus Coach</CardTitle>
        </div>
        <CardDescription>
          Get personalized insights into your work habits and learn how to improve your focus.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {result ? (
            <div className="space-y-4 text-sm">
                <p className="whitespace-pre-wrap">{result.analysis}</p>
                <div>
                    <h4 className="font-semibold mb-2">Key Takeaways:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        {result.keyTakeaways.map((takeaway, index) => (
                            <li key={index}>{takeaway}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">Click the button below to analyze your completed tasks and get productivity tips.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalysis} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {result ? 'Re-analyze My Focus' : 'Analyze My Focus'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
