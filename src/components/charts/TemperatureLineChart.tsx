"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_AVERAGE_TEMPERATURES } from '@/data/mockTemperature';
import { getTemperatures } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { AverageTemperatureData } from '@/types/temperature';

export function TemperatureLineChart() {
  const [data, setData] = useState<AverageTemperatureData[]>([]);

  useEffect(() => {
    // Merge mock average with real temperatures if available
    const myTemps = getTemperatures();
    const merged = MOCK_AVERAGE_TEMPERATURES.map(m => {
      const real = myTemps.find(t => t.date === m.date);
      return {
        ...m,
        date: m.date.slice(5), // MM-DD
        myTemperature: real ? real.temperature : m.myTemperature,
      };
    });
    setData(merged);
  }, []);

  if (data.length === 0) return <div className="h-[200px] bg-neutral-100 animate-pulse rounded-xl" />;

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F5E1" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#777777' }} 
            dy={10}
          />
          <YAxis 
            domain={[35.0, 37.5]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#777777' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#222222', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="schoolLevelAverage" 
            name="같은 학교급 평균" 
            stroke="#E5F5E1" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="myTemperature" 
            name="나의 온도" 
            stroke="#58C85A" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#58C85A', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
