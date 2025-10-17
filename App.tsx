import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from './components/Button';

// Helper Icon Components
const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const RefreshCwIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6">
        <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
    </svg>
);

// Workout Icon Components
interface IconProps {
  className?: string;
}

const ChestPressIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 15h18" /><path d="M5 15v4" /><path d="M19 15v4" /><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 12v-2" /><path d="M10 10 7 8" /><path d="M14 10l3-2" /><path d="M5 8h14" />
        <path d="M5 8v-2h2v2" /><path d="M17 8v-2h2v2" />
    </svg>
);

const PullUpIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 3h18" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M12 12V3" />
        <path d="M10 10 7 13" /><path d="M14 10l3 3" /><path d="M12 14v5" /><path d="M10 19l-2-4" />
        <path d="M14 19l2-4" />
    </svg>
);

const SquatIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 8h18" /><path d="M5 8v-2h2v2" /><path d="M17 8v-2h2v2" /><path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 8v3" /><path d="M12 13v3" /><path d="M10 16 8 21" /><path d="M14 16l2 5" />
    </svg>
);

type Session = 'chestPress' | 'pullUp' | 'squat';
type TimerSelection = '45' | '60' | 'custom';

const sessionInfo: Record<Session, { name: string; icon: React.ReactElement }> = {
  chestPress: { name: 'Chest Press', icon: <ChestPressIcon /> },
  pullUp: { name: 'Pull Up', icon: <PullUpIcon /> },
  squat: { name: 'Squat', icon: <SquatIcon /> },
};


function App() {
  const [counts, setCounts] = useState<Record<Session, number>>({
    chestPress: 0,
    pullUp: 0,
    squat: 0,
  });
  const [activeSession, setActiveSession] = useState<Session>('chestPress');
  const [timerSelection, setTimerSelection] = useState<TimerSelection>('60');
  const [timerDuration, setTimerDuration] = useState(60);
  const [remainingTime, setRemainingTime] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const playAlertSound = useCallback(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime); // Increased volume to max
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 3); // Extended duration

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3); // Extended duration
  }, []);

  useEffect(() => {
    if (isTimerActive && remainingTime > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
    } else if (remainingTime === 0 && isTimerActive) {
      setIsTimerActive(false);
      playAlertSound();
      alert("Time's up! Back to work.");
      setRemainingTime(timerDuration);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isTimerActive, remainingTime, timerDuration, playAlertSound]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
    }
    setIsTimerActive(false);
    setRemainingTime(timerDuration);
  }, [timerDuration]);
  
  const handleIncrement = useCallback(() => {
    setCounts(prevCounts => ({
      ...prevCounts,
      [activeSession]: prevCounts[activeSession] + 1,
    }));
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    setRemainingTime(timerDuration);
    setIsTimerActive(true);
  }, [activeSession, timerDuration]);

  const handleDecrement = useCallback(() => {
    setCounts(prevCounts => ({
      ...prevCounts,
      [activeSession]: Math.max(0, prevCounts[activeSession] - 1), // Prevent going below 0
    }));
  }, [activeSession]);

  const handleReset = useCallback(() => {
    setCounts({
      chestPress: 0,
      pullUp: 0,
      squat: 0,
    });
    stopTimer();
  }, [stopTimer]);

  const handleSessionChange = (sessionKey: Session) => {
    stopTimer();
    setActiveSession(sessionKey);
  };
  
  const handleTimerDurationChange = (duration: number) => {
      if (!isNaN(duration) && duration > 0) {
        setTimerDuration(duration);
        if (!isTimerActive) {
            setRemainingTime(duration);
        }
      }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Workout Counter</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">Select an exercise and track your reps</p>
        
        <div className="flex justify-center items-center space-x-2 mb-6" role="tablist" aria-label="Workout Sessions">
            {Object.keys(sessionInfo).map((key) => {
                const sessionKey = key as Session;
                const isActive = activeSession === sessionKey;
                return (
                <button
                    key={sessionKey}
                    onClick={() => handleSessionChange(sessionKey)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="counter-panel"
                    className={`flex-1 flex flex-col items-center p-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    isActive
                        ? 'bg-indigo-500 text-white shadow-lg focus:ring-indigo-400'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-indigo-400'
                    }`}
                >
                    {React.cloneElement(sessionInfo[sessionKey].icon, { className: 'h-8 w-8 mb-1' })}
                    <span className="text-sm font-semibold">{sessionInfo[sessionKey].name}</span>
                </button>
                );
            })}
        </div>
        
        <div className="text-6xl font-mono font-bold text-indigo-600 dark:text-indigo-400 my-4"
             aria-live="polite"
             role="timer"
        >
            {formatTime(remainingTime)}
        </div>

        <div id="counter-panel" role="tabpanel" className="w-full grid grid-cols-3 gap-4 mb-6">
            {(Object.keys(sessionInfo) as Session[]).map((sessionKey) => {
                const isActive = activeSession === sessionKey;
                const currentCount = counts[sessionKey];
                
                const getCountColor = (count: number) => {
                    if (count > 0) return 'text-green-500';
                    return 'text-gray-800 dark:text-gray-200';
                };

                return (
                    <div 
                        key={sessionKey} 
                        className={`flex flex-col items-center justify-center p-3 rounded-lg shadow-inner transition-all duration-300 ${
                            isActive 
                            ? 'bg-indigo-100 dark:bg-gray-900 ring-2 ring-indigo-500' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                    >
                        <div className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {React.cloneElement(sessionInfo[sessionKey].icon, { className: 'h-8 w-8' })}
                        </div>
                        <p className={`text-5xl font-bold mt-2 ${getCountColor(currentCount)}`}>{currentCount}</p>
                    </div>
                );
            })}
        </div>
        
        <div className="my-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Rest Timer
            </label>
            <div className="flex justify-center gap-2">
                {(['45', '60', 'custom'] as TimerSelection[]).map(selection => {
                    const isActive = timerSelection === selection;
                    let duration: number | undefined;
                    if(selection === '45') duration = 45;
                    if(selection === '60') duration = 60;

                    return (
                        <button key={selection}
                            onClick={() => {
                                setTimerSelection(selection);
                                if(duration) {
                                    handleTimerDurationChange(duration);
                                }
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                                isActive 
                                ? 'bg-indigo-500 text-white shadow'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {selection === 'custom' ? 'Custom' : `${selection}s`}
                        </button>
                    )
                })}
            </div>
            {timerSelection === 'custom' && (
                 <input
                    type="number"
                    id="timer-duration"
                    value={timerDuration}
                    onChange={(e) => handleTimerDurationChange(parseInt(e.target.value, 10))}
                    className="w-full p-2 mt-3 text-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                    placeholder="Seconds"
                />
            )}
        </div>

        <div className="flex flex-col gap-4">
            {/* Primary Action */}
            <Button 
                onClick={handleIncrement} 
                className="bg-green-500 hover:bg-green-600 focus:ring-green-400 w-full flex items-center justify-center py-4 text-xl shadow-lg"
            >
                <PlusIcon />
                <span>Count Up</span>
            </Button>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Button 
                    onClick={handleDecrement} 
                    className="bg-red-500 hover:bg-red-600 focus:ring-red-400 flex items-center justify-center"
                >
                    <MinusIcon />
                    <span>Reduce</span>
                </Button>
                <Button 
                    onClick={handleReset} 
                    className="bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 flex items-center justify-center"
                    disabled={Object.values(counts).every(c => c === 0) && !isTimerActive}
                >
                    <RefreshCwIcon />
                    <span>Reset All</span>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
