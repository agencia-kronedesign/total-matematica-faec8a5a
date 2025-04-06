import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ProgressSection = () => {
  // Dados simulados para o gráfico
  const progressData = [
    { month: 'Jan', me: 0, average: 50 },
    { month: 'Fev', me: 50, average: 100 },
    { month: 'Mar', me: 70, average: 150 },
    { month: 'Abr', me: 90, average: 100 },
    { month: 'Mai', me: 110, average: 50 },
    { month: 'Jun', me: 150, average: 100 },
    { month: 'Jul', me: 200, average: 150 },
    { month: 'Ago', me: 280, average: 200 },
    { month: 'Set', me: 320, average: 250 },
  ];

  // Configuração do gráfico
  const chartConfig = {
    me: {
      label: 'Eu',
      theme: {
        light: '#0A2463',
        dark: '#0A2463',
      },
    },
    average: {
      label: 'Média da escola',
      theme: {
        light: '#D1D5DB',
        dark: '#6B7280',
      },
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">MINHA EVOLUÇÃO</CardTitle>
          <div className="flex items-center gap-3">
            <RadioGroup defaultValue="eu" className="flex">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="eu" id="eu" />
                <Label htmlFor="eu" className="text-xs">Eu</Label>
              </div>
              <div className="flex items-center space-x-1 ml-4">
                <RadioGroupItem value="escola" id="escola" />
                <Label htmlFor="escola" className="text-xs">Minha escola</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full"
          >
            <AreaChart data={progressData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="meGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-me)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-me)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-average)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-average)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent
                        className="w-[180px]"
                        label={label}
                        payload={payload}
                      />
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="average"
                name="average"
                fill="url(#averageGradient)"
                stroke="var(--color-average)"
                strokeWidth={2}
                activeDot={{ r: 8, strokeWidth: 0 }}
                dot={{ strokeWidth: 0, r: 0 }}
              />
              <Area
                type="monotone"
                dataKey="me"
                name="me"
                fill="url(#meGradient)"
                stroke="var(--color-me)"
                strokeWidth={2}
                activeDot={{ r: 6, fill: "var(--color-me)", strokeWidth: 0 }}
                dot={{
                  r: 4,
                  fill: "var(--color-me)",
                  strokeWidth: 0,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressSection;
