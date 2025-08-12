
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RefreshCw, Coffee, Brain } from 'lucide-react';
import { Progress } from './ui/progress';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
}

const MODE_ICONS: Record<TimerMode, React.ElementType> = {
    work: Brain,
    shortBreak: Coffee,
    longBreak: Coffee,
}

export function PomodoroTimer() {
  const [mode, setMode] = React.useState<TimerMode>('work');
  const [timeRemaining, setTimeRemaining] = React.useState(MODE_DURATIONS.work);
  const [isActive, setIsActive] = React.useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
  }, []);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      audioRef.current?.play().catch(e => console.error("Error playing sound", e));
      handleTimerEnd();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const handleTimerEnd = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newCompletedCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCompletedCount);
      if (newCompletedCount % 4 === 0) {
        setMode('longBreak');
        setTimeRemaining(MODE_DURATIONS.longBreak);
      } else {
        setMode('shortBreak');
        setTimeRemaining(MODE_DURATIONS.shortBreak);
      }
    } else {
      setMode('work');
      setTimeRemaining(MODE_DURATIONS.work);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(MODE_DURATIONS[mode]);
  };
  
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeRemaining(MODE_DURATIONS[newMode]);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const progress = (1 - timeRemaining / MODE_DURATIONS[mode]) * 100;
  const CurrentIcon = MODE_ICONS[mode];


  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <CurrentIcon className="h-6 w-6" />
            <span>{MODE_LABELS[mode]}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <div className="relative h-48 w-48">
            <Progress value={progress} className="h-full w-full rounded-full" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold font-mono tracking-tighter">
                    {formatTime(timeRemaining)}
                </span>
            </div>
        </div>

        <div className="flex justify-center gap-2">
            <Button variant={mode === 'work' ? 'default' : 'outline'} onClick={() => switchMode('work')}>Focus</Button>
            <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
            <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={() => switchMode('longBreak')}>Long Break</Button>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button onClick={toggleTimer} size="lg" className="w-32">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RefreshCw />
          </Button>
        </div>
        <div className="text-center text-muted-foreground">
            <p>Pomodoros completed: {pomodorosCompleted}</p>
        </div>
      </CardContent>
    </Card>
  );
}
