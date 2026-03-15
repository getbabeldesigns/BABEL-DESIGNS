import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Option = {
  label: string;
  value: string;
};

type QuizStep = {
  id:
    | 'mood'
    | 'material'
    | 'budget'
    | 'scale'
    | 'palette'
    | 'light'
    | 'texture'
    | 'silhouette'
    | 'function'
    | 'timeline';
  title: string;
  options: Option[];
};

const quizSteps: QuizStep[] = [
  {
    id: 'mood',
    title: 'Which spatial mood feels right?',
    options: [
      { label: 'Monumental and bold', value: 'monolith' },
      { label: 'Soft and contemplative', value: 'stillness' },
      { label: 'Raw and essential', value: 'origin' },
    ],
  },
  {
    id: 'material',
    title: 'Choose your primary material direction',
    options: [
      { label: 'Stone / mineral surfaces', value: 'Italian Travertine' },
      { label: 'Warm wood textures', value: 'White Oak' },
      { label: 'Metal accents', value: 'Bronze Hardware' },
    ],
  },
  {
    id: 'budget',
    title: 'Your comfort range for first picks',
    options: [
      { label: 'Up to INR 3,000', value: '0-3000' },
      { label: 'INR 3,001 to 7,000', value: '3001-7000' },
      { label: 'INR 7,001+', value: '7001+' },
    ],
  },
  {
    id: 'scale',
    title: 'Preferred scale of statement pieces',
    options: [
      { label: 'Sculptural focal points', value: 'hero' },
      { label: 'Balanced, room-defining', value: 'balanced' },
      { label: 'Subtle, supporting accents', value: 'accent' },
    ],
  },
  {
    id: 'palette',
    title: 'Color direction that feels natural',
    options: [
      { label: 'Warm neutrals', value: 'warm-neutral' },
      { label: 'Cool mineral tones', value: 'cool-mineral' },
      { label: 'High-contrast monochrome', value: 'monochrome' },
    ],
  },
  {
    id: 'light',
    title: 'Lighting mood you gravitate toward',
    options: [
      { label: 'Soft and diffused', value: 'soft' },
      { label: 'Focused pools of light', value: 'focused' },
      { label: 'Bright and airy', value: 'airy' },
    ],
  },
  {
    id: 'texture',
    title: 'Texture preference',
    options: [
      { label: 'Smooth and refined', value: 'refined' },
      { label: 'Tactile and hand-finished', value: 'tactile' },
      { label: 'Raw and expressive', value: 'raw' },
    ],
  },
  {
    id: 'silhouette',
    title: 'Silhouette language',
    options: [
      { label: 'Clean geometric lines', value: 'geometric' },
      { label: 'Soft organic forms', value: 'organic' },
      { label: 'Architectural volumes', value: 'architectural' },
    ],
  },
  {
    id: 'function',
    title: 'Primary use for your space',
    options: [
      { label: 'Entertaining and hosting', value: 'hosting' },
      { label: 'Everyday living', value: 'living' },
      { label: 'Quiet retreat', value: 'retreat' },
    ],
  },
  {
    id: 'timeline',
    title: 'Ideal timeline to begin',
    options: [
      { label: 'Immediately', value: 'now' },
      { label: 'Within 1–3 months', value: 'soon' },
      { label: 'Exploring for later', value: 'later' },
    ],
  },
];

const StyleQuiz = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const step = quizSteps[index];
  const canProceed = Boolean(answers[step.id]);
  const isComplete = index === quizSteps.length - 1;

  const progress = useMemo(() => ((index + 1) / quizSteps.length) * 100, [index]);

  const onSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const onNext = () => {
    if (!canProceed) return;
    if (isComplete) {
      const params = new URLSearchParams({
        collection: answers.mood,
        material: answers.material,
        price: answers.budget,
      });
      navigate(`/collections?${params.toString()}`);
      return;
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-2xl border border-border/70 bg-card/70 p-8 md:p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Personalized Style Quiz</p>
            <h1 className="mb-6 font-serif text-4xl font-light">Find Your Collection Direction</h1>
            <div className="mb-8 h-1.5 bg-secondary/60">
              <motion.div className="h-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
            <p className="mb-5 text-sm uppercase tracking-[0.18em] text-muted-foreground">Question {index + 1} of {quizSteps.length}</p>
            <h2 className="mb-6 font-serif text-2xl">{step.title}</h2>

            <div className="space-y-3">
              {step.options.map((option) => {
                const active = answers[step.id] === option.value;
                return (
                  <button key={option.value} onClick={() => onSelect(option.value)} className={`w-full border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:border-foreground/50'}`}>
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setIndex((prev) => Math.max(0, prev - 1))} disabled={index === 0} className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40">
                Back
              </button>
              <button onClick={onNext} disabled={!canProceed} className="ml-auto bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background disabled:cursor-not-allowed disabled:opacity-40">
                {isComplete ? 'See My Matches' : 'Continue'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StyleQuiz;
