"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_MONTHLY_AVERAGE } from '@/data/mockTemperature';

export function MonthlyTemperatureChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={MOCK_MONTHLY_AVERAGE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE5FC" />
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#8372A6' }} 
          dy={10}
        />
        <YAxis 
          domain={[35.0, 37.5]} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#8372A6' }}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          cursor={{ fill: '#F6F2FF' }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
        <Bar dataKey="schoolLevelAverage" name="학교급 평균" fill="#EBE5FC" radius={[4, 4, 0, 0]} />
        <Bar dataKey="myAverage" name="나의 평균" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
