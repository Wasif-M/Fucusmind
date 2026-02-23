import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/glass-card';
import { Checkin } from '@shared/schema';
import { TrendingUp } from 'lucide-react';

interface MoodChartProps {
  data: Checkin[];
}

export function MoodChart({ data }: MoodChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  
  const chartData = sortedData.map(item => ({
    date: new Date(item.createdAt!).getTime(),
    mood: item.moodScore,
    stress: item.stressLevel,
    formattedDate: format(new Date(item.createdAt!), 'MMM d'),
  }));

  const hasData = chartData.length > 0;
  const hasSinglePoint = chartData.length === 1;

  return (
    <GlassCard className="h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Mood Trends</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Mood</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400" />
            <span className="text-muted-foreground">Stress</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">No check-in data yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Complete daily check-ins to see your mood trends</p>
        </div>
      ) : hasSinglePoint ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex gap-8 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{chartData[0].mood}</div>
              <div className="text-sm text-muted-foreground">Mood Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">{chartData[0].stress}</div>
              <div className="text-sm text-muted-foreground">Stress Level</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Add more check-ins to see trends over time</p>
        </div>
      ) : (
      <div className="flex-1 w-full" style={{ minHeight: '280px' }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(265, 89%, 66%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(265, 89%, 66%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return format(new Date(payload[0].payload.date), 'MMMM d, yyyy');
                }
                return '';
              }}
            />
            <Area 
              type="monotone" 
              dataKey="mood" 
              stroke="hsl(265, 89%, 66%)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMood)" 
            />
            <Area 
              type="monotone" 
              dataKey="stress" 
              stroke="#f472b6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorStress)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </GlassCard>
  );
}
