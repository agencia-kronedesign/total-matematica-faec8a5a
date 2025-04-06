
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BookText, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MedalsSection = () => {
  const medals = [
    {
      id: 1,
      title: 'SÃO 23 DIAS SEGUIDOS',
      description: 'Faltam 7 dias para a próxima medalha',
      icon: <Award className="h-10 w-10 text-yellow-500" />,
      color: 'bg-yellow-100 border-yellow-200',
    },
    {
      id: 2,
      title: 'RESOLVEDOR DE EQUAÇÕES DO 1º GRAU',
      description: 'Finalizou 20 exercícios',
      icon: <BookText className="h-10 w-10 text-blue-500" />,
      color: 'bg-blue-100 border-blue-200',
    },
    {
      id: 3,
      title: '5º ANO EM COMPLETO',
      description: 'Faltam 9 exercícios para completar',
      icon: <FileCheck className="h-10 w-10 text-green-500" />,
      color: 'bg-green-100 border-green-200',
    },
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">MINHAS MEDALHAS</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {medals.map((medal) => (
          <div 
            key={medal.id} 
            className={`flex items-center gap-3 p-3 rounded-lg border ${medal.color}`}
          >
            <div className="shrink-0">
              {medal.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold leading-tight">{medal.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{medal.description}</p>
            </div>
          </div>
        ))}
        
        <Button className="w-full mt-2 bg-totalBlue hover:bg-blue-900">
          MAIS EXERCÍCIOS
        </Button>
      </CardContent>
    </Card>
  );
};

export default MedalsSection;
