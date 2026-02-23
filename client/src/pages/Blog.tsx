import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const posts = [
  {
    title: "5 Simple Grounding Techniques for Everyday Anxiety",
    category: "Wellness",
    date: "Feb 5, 2026",
    excerpt: "Learn practical grounding exercises you can use anywhere to calm your nervous system and find your centre again.",
    readTime: "4 min read",
    content: `Anxiety can strike at any moment, but having a set of grounding techniques in your toolkit can make all the difference. Here are five simple practices you can use anywhere, anytime.\n\n**1. The 5-4-3-2-1 Technique**\nThis sensory awareness exercise pulls you back into the present moment. Identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. By engaging all your senses, you redirect your brain away from anxious thoughts and into the here and now.\n\n**2. Box Breathing**\nInhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat this cycle four times. This technique is used by Navy SEALs and first responders to stay calm under pressure. It works by activating your parasympathetic nervous system.\n\n**3. Progressive Muscle Relaxation**\nStarting from your toes and working up, tense each muscle group for 5 seconds, then release. Notice the contrast between tension and relaxation. This helps you become aware of where you're holding stress in your body.\n\n**4. The Grounding Walk**\nTake a slow, deliberate walk and focus entirely on the sensation of your feet touching the ground. Feel the heel strike, the roll through the mid-foot, and the push-off from the toes. This moving meditation can be done anywhere, even in a hallway.\n\n**5. Cold Water Reset**\nSplash cold water on your face or hold an ice cube. The sudden temperature change triggers the dive reflex, which naturally slows your heart rate and calms your nervous system. It's a quick physiological reset that can interrupt a panic response.\n\nThe key with all these techniques is practice. Try them when you're calm so they become second nature when anxiety hits. FocusMind's grounding tools section offers guided versions of several of these exercises.`
  },
  {
    title: "How Sleep Quality Affects Your Mental Clarity",
    category: "Research",
    date: "Jan 29, 2026",
    excerpt: "New studies reveal the direct link between sleep patterns and cognitive performance. Here's what you need to know.",
    readTime: "6 min read",
    content: `Sleep isn't just rest. It's when your brain does its most important maintenance work. Recent research has painted a clearer picture than ever of how sleep quality directly impacts your mental clarity, decision-making, and emotional resilience.\n\n**The Glymphatic System**\nDuring deep sleep, your brain's glymphatic system kicks into high gear, clearing out metabolic waste products including beta-amyloid proteins. Think of it as your brain's overnight cleaning crew. Poor sleep means this cleanup is incomplete, leading to that foggy feeling the next day.\n\n**Sleep Architecture Matters**\nIt's not just about hours. A full night of fragmented sleep can leave you more impaired than a shorter period of uninterrupted, quality sleep. Each sleep cycle, lasting roughly 90 minutes, moves through light sleep, deep sleep, and REM sleep. Each stage serves a different purpose for cognitive function.\n\n**Deep Sleep and Memory**\nDuring deep slow-wave sleep, your brain consolidates declarative memories, transferring information from the hippocampus to the neocortex for long-term storage. Disruptions to this stage can impair learning and recall by up to 40%.\n\n**REM Sleep and Emotional Processing**\nREM sleep is when your brain processes emotional experiences from the day. Research from the University of California, Berkeley shows that REM sleep strips the emotional charge from memories, helping you wake up with better perspective. Without adequate REM sleep, you're more reactive and less emotionally regulated.\n\n**Practical Steps for Better Sleep Quality**\n- Keep a consistent sleep schedule, even on weekends\n- Limit screen exposure 60 minutes before bed\n- Keep your bedroom cool, between 65 and 68 degrees\n- Track your sleep patterns to identify what helps and what hurts\n\nFocusMind's sleep tracking feature helps you monitor these patterns and correlate them with your mood and stress levels over time.`
  },
  {
    title: "Building a Morning Routine That Actually Sticks",
    category: "Habits",
    date: "Jan 22, 2026",
    excerpt: "Why most morning routines fail and how to build one that supports your mental wellness goals without feeling overwhelming.",
    readTime: "5 min read",
    content: `We've all seen those elaborate morning routines on social media: wake at 5am, meditate, journal, exercise, cold shower, read. The reality? Most people who attempt these quit within two weeks. Here's a more sustainable approach.\n\n**Why Most Routines Fail**\nThe biggest mistake is trying to overhaul your entire morning at once. Behaviour science tells us that habits form through small, consistent repetitions, not dramatic changes. When you try to add five new habits simultaneously, you're setting yourself up for failure.\n\n**The Two-Minute Rule**\nStart with one habit that takes two minutes or less. Want to meditate? Start with two minutes of focused breathing. Want to journal? Write one sentence about how you feel. The goal isn't the activity itself; it's building the neural pathway that makes the behaviour automatic.\n\n**Stack, Don't Replace**\nAttach your new habit to something you already do. After you pour your morning coffee (existing habit), take three deep breaths (new habit). This technique, called habit stacking, leverages your brain's existing routines as anchors for new ones.\n\n**Design Your Environment**\nPut your journal next to your coffee maker. Set your meditation cushion where you'll see it. Remove friction from the habits you want and add friction to the ones you don't. Your environment shapes your behaviour more than your willpower ever will.\n\n**Track, Don't Judge**\nUse FocusMind to simply notice how your morning affects your day. Over time, you'll see patterns emerge. Maybe two minutes of breathing in the morning correlates with lower afternoon stress. That data becomes your motivation, far more powerful than any Instagram inspiration.\n\n**Progress Over Perfection**\nMissed a day? That's fine. Research shows that missing one day has no measurable impact on long-term habit formation. What matters is getting back to it the next day. The goal is consistency over months, not perfection over days.`
  },
  {
    title: "Understanding Your Stress Patterns with AI",
    category: "Product",
    date: "Jan 15, 2026",
    excerpt: "How FocusMind's AI analysis helps you identify hidden stress triggers and build healthier response patterns.",
    readTime: "3 min read",
    content: `Stress rarely comes from a single source. It's usually a combination of factors that build up over time. FocusMind's AI analysis is designed to help you see patterns that are invisible in the moment.\n\n**Beyond Surface-Level Tracking**\nTraditional mood trackers ask you to rate your day on a scale. FocusMind goes deeper, analysing the relationships between your sleep quality, stress levels, mood patterns, and exercise completion to reveal connections you might not notice on your own.\n\n**Pattern Recognition**\nAfter just a week of check-ins, the AI begins identifying correlations. Maybe your stress spikes every Wednesday, which might relate to a recurring meeting. Perhaps your mood dips when you sleep less than 7 hours. These insights emerge from the data, not from guesswork.\n\n**Personalised Recommendations**\nBased on your patterns, FocusMind suggests specific grounding exercises and activities that have worked for you before. Had a rough night's sleep? The AI might recommend a calming body scan rather than an energising breathing exercise.\n\n**Privacy-First Approach**\nYour wellness data stays private. The AI analysis happens in real-time and doesn't store conversation history beyond what you explicitly save. You control what's tracked and what's shared.\n\nThe goal isn't to eliminate stress, that's neither possible nor desirable. It's to understand your unique relationship with stress so you can respond to it more effectively.`
  },
  {
    title: "The Science Behind the 4-7-8 Breathing Technique",
    category: "Research",
    date: "Jan 8, 2026",
    excerpt: "Discover why this simple breathing pattern is one of the most effective tools for calming your parasympathetic nervous system.",
    readTime: "4 min read",
    content: `The 4-7-8 breathing technique, popularised by Dr. Andrew Weil, is one of the simplest yet most effective tools for calming anxiety and promoting relaxation. But why does breathing in a specific pattern work so well?\n\n**The Vagus Nerve Connection**\nThe vagus nerve is the longest cranial nerve in your body, running from your brainstem to your abdomen. Extended exhales, like the 8-count exhale in this technique, stimulate the vagus nerve, which activates your parasympathetic nervous system, the one responsible for rest and recovery.\n\n**CO2 Tolerance**\nThe 7-second hold builds your tolerance to carbon dioxide. When CO2 levels rise slightly in your blood, your body's initial response is to feel anxious and breathe faster. By practising tolerance to this sensation, you train your body to remain calm in situations that would normally trigger a stress response.\n\n**The Technique**\n- Exhale completely through your mouth\n- Inhale quietly through your nose for 4 seconds\n- Hold your breath for 7 seconds\n- Exhale completely through your mouth for 8 seconds\n- Repeat the cycle 3-4 times\n\n**When to Use It**\nThis technique works best as a preventive practice done twice daily, and as an in-the-moment tool when you feel stress building. Many users report that after two weeks of regular practice, their baseline anxiety levels decrease noticeably.\n\n**What the Research Shows**\nA 2023 study published in Cell Reports Medicine found that structured breathing exercises outperformed meditation for reducing physiological markers of stress, including cortisol levels and heart rate variability. The key advantage: breathing exercises provide an immediate, measurable effect.\n\nFocusMind's breathing tool guides you through the 4-7-8 pattern with visual and audio cues, making it easy to practise even when you're feeling overwhelmed.`
  },
  {
    title: "Why Tracking Your Mood Actually Matters",
    category: "Wellness",
    date: "Jan 1, 2026",
    excerpt: "Research shows that simply observing and recording your emotional state can lead to better emotional regulation over time.",
    readTime: "5 min read",
    content: `You might wonder whether simply writing down how you feel can really make a difference. The research is clear: it can, and here's why.\n\n**Affect Labelling**\nNeuroscience research from UCLA has shown that the simple act of naming an emotion, a process called affect labelling, reduces activity in the amygdala, the brain's emotional alarm system. When you check in and identify that you're feeling "anxious" rather than just "bad," you're already beginning to regulate that emotion.\n\n**The Observer Effect**\nIn psychology, this is related to metacognition: thinking about your thinking. When you step back to observe and record your emotional state, you create distance between yourself and the emotion. This distance gives you choice, instead of being swept up in a feeling, you can notice it and decide how to respond.\n\n**Spotting Trends**\nDay-to-day mood fluctuations feel random in the moment. But tracked over weeks and months, clear patterns emerge. You might discover that your mood consistently dips on Sundays (the "Sunday scaries"), or that you feel most energised after days when you completed grounding exercises.\n\n**Building Self-Awareness**\nRegular mood tracking builds what psychologists call interoceptive awareness, your ability to sense and understand your internal states. People with higher interoceptive awareness tend to make better decisions, have stronger emotional regulation, and experience greater overall wellbeing.\n\n**Making It Simple**\nThe key is making tracking effortless. FocusMind's daily check-in takes less than a minute: rate your mood, log your sleep, note your stress level, and add optional notes. That's it. No lengthy journaling required, unless you want to.\n\n**The Compound Effect**\nLike physical exercise, the benefits of mood tracking compound over time. After a month, you have data. After three months, you have patterns. After six months, you have genuine self-knowledge that informs better choices about your mental wellness.`
  },
];

export { posts, slugify };

export default function Blog() {
  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            The FocusMind{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              Blog
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80]">Insights, research, and practical tips for your mental wellness journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-7 flex flex-col" data-testid={`card-blog-${post.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#9b6dff]/10 text-[#c9a6ff] border border-[#9b6dff]/20">
                  {post.category}
                </span>
                <span className="text-[11px] text-[#6b6b80]">{post.readTime}</span>
              </div>
              <h3 className="text-[16px] font-semibold mb-3 leading-[1.4]">{post.title}</h3>
              <p className="text-[13px] text-[#6b6b80] leading-[1.7] mb-4 flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-[#6b6b80]">{post.date}</span>
                <Link href={`/blog/${slugify(post.title)}`} className="text-[13px] text-[#9b6dff] font-medium" data-testid={`link-read-more-${slugify(post.title).slice(0, 20)}`}>Read more</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}

export function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const post = posts.find((p) => slugify(p.title) === slug);

  if (!post) {
    return (
      <InfoPageLayout>
        <div className="max-w-[800px] mx-auto px-6 text-center py-20">
          <h1 className="text-2xl font-semibold mb-4">Post not found</h1>
          <Link href="/blog" className="text-[#9b6dff] font-medium">Back to blog</Link>
        </div>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[13px] text-[#9b6dff] font-medium mb-8" data-testid="link-back-to-blog">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>
        <div className="flex items-center gap-3 mb-5">
          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#9b6dff]/10 text-[#c9a6ff] border border-[#9b6dff]/20">
            {post.category}
          </span>
          <span className="text-[11px] text-[#6b6b80]">{post.readTime}</span>
          <span className="text-[11px] text-[#6b6b80]">{post.date}</span>
        </div>
        <h1 className="text-[clamp(26px,3.5vw,40px)] font-semibold leading-[1.3] mb-6" data-testid="text-blog-title">{post.title}</h1>
        <div className="prose prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return <h3 key={i} className="text-[18px] font-semibold mt-8 mb-3 text-white">{paragraph.replace(/\*\*/g, "")}</h3>;
            }
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="text-[15px] text-[#a0a0b4] leading-[1.85] mb-4">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**")
                    ? <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, "")}</strong>
                    : part.startsWith("- ")
                      ? <span key={j} className="block pl-4 py-0.5">{part}</span>
                      : part
                )}
              </p>
            );
          })}
        </div>
      </div>
    </InfoPageLayout>
  );
}
