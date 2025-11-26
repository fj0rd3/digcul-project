'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

type Scene = 'intro' | 'class' | 'classroom' | 'home' | 'ending-passive' | 'ending-active';
type Direction = 'left' | 'right' | 'idle';

interface Position {
  x: number;
  y: number;
}

// Character sprites
const WALK_RIGHT_SPRITES = [
  '/game/avery-walk-right-1.svg',
  '/game/avery-walk-right-2.svg',
  '/game/avery-walk-right-3.svg',
  '/game/avery-walk-right-4.svg',
];

const WALK_LEFT_SPRITES = [
  '/game/avery-walk-left-1.svg',
  '/game/avery-walk-left-2.svg',
  '/game/avery-walk-left-3.svg',
  '/game/avery-walk-left-4.svg',
];

const IDLE_SPRITE = '/game/avery-stand.svg';

// Background images for each scene
const BACKGROUNDS: Record<Scene, string> = {
  intro: '/game/bg-school.png',
  class: '/game/bg-school.png',
  classroom: '/game/bg-classroom.png',
  home: '/game/bg-home.png',
  'ending-passive': '/game/bg-ending-passive.png',
  'ending-active': '/game/bg-ending-active.png',
};

export default function DigitalCultureGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [scene, setScene] = useState<Scene>('intro');
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [walkFrame, setWalkFrame] = useState(0);
  const [direction, setDirection] = useState<Direction>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [showCharacter, setShowCharacter] = useState(true);
  const [characterSize, setCharacterSize] = useState(100);
  const [showDee, setShowDee] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'avery' | 'dee' | 'narrator'>('avery');
  const gameRef = useRef<HTMLDivElement>(null);
  const voicesLoaded = useRef(false);
  const keysPressed = useRef(new Set<string>());
  const animationFrame = useRef<number | null>(null);
  const popSound = useRef<HTMLAudioElement | null>(null);
  const skipResolve = useRef<(() => void) | null>(null);

  // Initialize audio
  useEffect(() => {
    popSound.current = new Audio('/game/pop.wav');
  }, []);

  // Play pop sound
  const playPop = useCallback(() => {
    if (popSound.current) {
      popSound.current.currentTime = 0;
      popSound.current.play().catch(() => {});
    }
  }, []);

  // Skip current speech
  const skipSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (skipResolve.current) {
      setIsSpeaking(false);
      setCurrentText('');
      skipResolve.current();
      skipResolve.current = null;
    }
  }, []);

  // Get a good voice for speech
  const getVoice = useCallback((speaker: 'avery' | 'dee' | 'narrator'): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    
    // Preferred voices in order
    const femaleVoices = ['Samantha', 'Google UK English Female', 'Microsoft Zira', 'Karen', 'Moira', 'Tessa'];
    const maleVoices = ['Daniel', 'Google UK English Male', 'Microsoft David', 'Alex', 'Fred'];
    
    const preferredList = speaker === 'dee' ? maleVoices : femaleVoices;
    
    for (const name of preferredList) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    
    // Fallback to any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    return englishVoice || voices[0];
  }, []);

  // Load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        voicesLoaded.current = window.speechSynthesis.getVoices().length > 0;
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speak text using Web Speech API
  const speak = useCallback((text: string, speaker: 'avery' | 'dee' | 'narrator' = 'avery'): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentText(text);
      setCurrentSpeaker(speaker);
      setIsSpeaking(true);
      skipResolve.current = resolve;
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getVoice(speaker);
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95;
        utterance.pitch = speaker === 'dee' ? 0.9 : 1.1;
        utterance.onend = () => {
          if (skipResolve.current === resolve) {
            setIsSpeaking(false);
            setCurrentText('');
            skipResolve.current = null;
            resolve();
          }
        };
        utterance.onerror = () => {
          if (skipResolve.current === resolve) {
            setIsSpeaking(false);
            setCurrentText('');
            skipResolve.current = null;
            resolve();
          }
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback: just show text for a duration
        setTimeout(() => {
          if (skipResolve.current === resolve) {
            setIsSpeaking(false);
            setCurrentText('');
            skipResolve.current = null;
            resolve();
          }
        }, text.length * 50);
      }
    });
  }, [getVoice]);

  // Start game sequence
  const startGame = useCallback(async () => {
    setGameStarted(true);
    setScene('class');
    setPosition({ x: 0, y: -20 });
    setShowCharacter(true);
    setCharacterSize(100);
    playPop();
    
    await speak("Hello. Welcome to our digital culture project! Let's dive into social media's impact on youth politics.");
    await speak("You've had a long day and no lunch. What would you like to do?");
    await speak("Use the arrows on your keyboard to make me walk.");
  }, [speak, playPop]);

  // Handle scene transitions based on position
  useEffect(() => {
    if (!gameStarted || isSpeaking) return;

    const handleSceneTransition = async () => {
      // Go to class (right side)
      if (scene === 'class' && position.x >= 180) {
        playPop();
        setScene('classroom');
        setPosition({ x: 80, y: -30 });
        setCharacterSize(50);
        setDirection('idle');
        setShowDee(true);
        
        // Teacher speaks
        await speak("Hello class! We are undergoing a massive democratic crisis! The president has decided that gay people can't play soccer!", 'narrator');
        
        // Dee responds
        await speak("That's crazy! Let's go protest!", 'dee');
        
        // Transition to protest ending
        playPop();
        setScene('ending-active');
        setShowCharacter(false);
        setShowDee(false);
        setCharacterSize(100);
        
        await new Promise(r => setTimeout(r, 4000));
        await speak("Thanks for playing!", 'narrator');
        await speak("Start again and make different choices for another outcome! You can also explore the sections below for more insight.", 'narrator');
        restartGame();
      }
      
      // Go home (left side)
      if (scene === 'class' && position.x <= -180) {
        playPop();
        setScene('home');
        setPosition({ x: 0, y: 0 });
        setCharacterSize(80);
        setDirection('idle');
        
        await speak("Oh no! You've been scrolling on Instagram for four hours. What content are you watching?");
      }
      
      // From home, go up (non-political content) -> passive ending
      if (scene === 'home' && position.y > 100) {
        playPop();
        setScene('ending-passive');
        setShowCharacter(false);
        
        await speak("Spending a lot of time on social media and seeing little political content makes you");
        await speak("doubt the effectiveness of democratic institutions, especially those that require in person action.");
        await speak("When you come across a post about a new law against gay people playing soccer,");
        await speak("you consider protesting, but don't think it will do much good. Instead, you share a post opposing the law, and go to bed.");
        await new Promise(r => setTimeout(r, 4000));
        await speak("Thanks for playing!");
        await speak("Start again and make different choices for another outcome! You can also explore the sections below for more insight.");
        restartGame();
      }
      
      // From home, go down (political content) -> active ending
      if (scene === 'home' && position.y < -100) {
        playPop();
        setScene('ending-active');
        setShowCharacter(false);
        
        await speak("Seeing people argue by themselves about politics on social media makes you doubt online activism");
        await speak("But you watch a lot of political content, and trust the democratic process.");
        await speak("When you see a post by Hugo Décrypte about a law barring gay people from playing soccer");
        await speak("you call your friends to discuss and make plans to attend a protest.");
        await new Promise(r => setTimeout(r, 4000));
        await speak("Thanks for playing!");
        await speak("Start again and make different choices for another outcome! You can also explore the sections below for more insight.");
        restartGame();
      }
    };

    handleSceneTransition();
  }, [position, scene, gameStarted, isSpeaking, speak, playPop]);

  // Handle keyboard input
  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
      if (e.key === 'z' || e.key === 'Z') {
        skipSpeech();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  // Game loop for movement
  useEffect(() => {
    if (!gameStarted || isSpeaking) return;

    let frameCount = 0;

    const gameLoop = () => {
      frameCount++;
      
      setPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newDirection: Direction = 'idle';

        if (keysPressed.current.has('ArrowRight')) {
          newX = Math.min(prev.x + 4, 200);
          newDirection = 'right';
        }
        if (keysPressed.current.has('ArrowLeft')) {
          newX = Math.max(prev.x - 4, -200);
          newDirection = 'left';
        }
        if (keysPressed.current.has('ArrowUp')) {
          newY = Math.min(prev.y + 4, 120);
        }
        if (keysPressed.current.has('ArrowDown')) {
          newY = Math.max(prev.y - 4, -120);
        }

        setDirection(newDirection);

        // Update walking animation
        if (newDirection !== 'idle' && frameCount % 8 === 0) {
          setWalkFrame(f => (f + 1) % 4);
        }

        return { x: newX, y: newY };
      });

      animationFrame.current = requestAnimationFrame(gameLoop);
    };

    animationFrame.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [gameStarted, isSpeaking]);

  // Get current sprite
  const getCurrentSprite = () => {
    if (direction === 'right') {
      return WALK_RIGHT_SPRITES[walkFrame];
    } else if (direction === 'left') {
      return WALK_LEFT_SPRITES[walkFrame];
    }
    return IDLE_SPRITE;
  };

  // Restart game
  const restartGame = () => {
    window.speechSynthesis?.cancel();
    setGameStarted(false);
    setScene('intro');
    setPosition({ x: 0, y: 0 });
    setWalkFrame(0);
    setDirection('idle');
    setIsSpeaking(false);
    setCurrentText('');
    setShowCharacter(true);
    setCharacterSize(100);
    setShowDee(false);
    setCurrentSpeaker('avery');
  };

  // Show only the start button initially
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-8 text-center">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-3 shadow-lg mx-auto hover:scale-105"
          >
            <span className="text-2xl">▶</span> Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center animate-fade-in">
      {/* Game Canvas */}
      <div 
        ref={gameRef}
        className="relative w-full max-w-[600px] lg:min-w-[500px] rounded-xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-900 flex-shrink-0 animate-slide-in-left"
        style={{ aspectRatio: '4/3' }}
        tabIndex={0}
      >
        {/* Background image */}
        <Image
          src={BACKGROUNDS[scene]}
          alt="Scene background"
          fill
          className="object-cover"
          priority
        />

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Game area */}
        <>
          {/* Play Again button during endings */}
          {(scene === 'ending-passive' || scene === 'ending-active') && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={restartGame}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Character - Avery */}
          {showCharacter && (
            <div
              className="absolute transition-all duration-75 z-10"
              style={{
                left: `calc(50% + ${position.x}px)`,
                bottom: `calc(25% + ${position.y}px)`,
                transform: 'translateX(-50%)',
                width: `${characterSize}px`,
                height: `${characterSize * 1.9}px`,
              }}
            >
              <Image
                src={getCurrentSprite()}
                alt="Avery"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Character - Dee */}
          {showDee && (
            <div
              className="absolute z-10"
              style={{
                left: 'calc(50% + 120px)',
                bottom: 'calc(25% - 40px)',
                transform: 'translateX(-50%)',
                width: '50px',
                height: '95px',
              }}
            >
              <Image
                src="/game/dee-stand.svg"
                alt="Dee"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </>

      </div>

      {/* Speech Panel - Right Side */}
      <div className="w-full lg:w-80 flex-shrink-0 animate-slide-in-right">
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-5 min-h-[200px]">
          {/* Panel Header */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-700/50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
              currentSpeaker === 'dee' ? 'bg-blue-500/20' : currentSpeaker === 'narrator' ? 'bg-purple-500/20' : 'bg-orange-500/20'
            }`}>
              <span className="text-xl">
                {currentSpeaker === 'dee' ? '🧑' : currentSpeaker === 'narrator' ? '📢' : '🧑‍🎓'}
              </span>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">
                {currentSpeaker === 'dee' ? 'Your Friend' : currentSpeaker === 'narrator' ? 'Professor' : 'Disembodied Voice'}
              </h4>
              <p className="text-zinc-500 text-xs">
                {currentSpeaker === 'dee' ? 'Your friend' : currentSpeaker === 'narrator' ? 'Story' : 'Your guide'}
              </p>
            </div>
          </div>

          {/* Speech Content */}
          <div className="transition-opacity duration-300">
            {currentText ? (
              <div>
                <p className="text-zinc-200 text-sm leading-relaxed">{currentText}</p>
                <div className={`mt-4 flex items-center gap-2 transition-colors duration-300 ${
                  currentSpeaker === 'dee' ? 'text-blue-400' : currentSpeaker === 'narrator' ? 'text-purple-400' : 'text-orange-400'
                }`}>
                  <span className="animate-pulse text-lg">●</span>
                  <span className="text-xs font-medium">Speaking...</span>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">
                {scene === 'ending-passive' || scene === 'ending-active' ? (
                  <p>You&apos;ve reached an ending! Click <span className="text-orange-400 font-medium">Play Again</span> to try a different path.</p>
                ) : (
                  <p>Use the <span className="text-white font-medium">arrow keys</span> to move and explore. Make your choices!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions Card */}
        <div 
          className={`mt-4 bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/30 transition-all duration-300 ${
            !isSpeaking && scene !== 'ending-passive' && scene !== 'ending-active' && gameStarted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none h-0 mt-0 p-0 overflow-hidden'
          }`}
        >
          <h5 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Controls</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded border border-zinc-600">←</kbd>
              <span>Move left</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded border border-zinc-600">→</kbd>
              <span>Move right</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded border border-zinc-600">↑</kbd>
              <span>Move up</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded border border-zinc-600">↓</kbd>
              <span>Move down</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
