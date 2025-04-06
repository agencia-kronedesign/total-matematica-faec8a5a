
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const DailyExerciseSection = () => {
  const [userAnswer, setUserAnswer] = useState('');
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-totalBlue font-bold text-lg">EXERCÍCIO DO DIA</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox id="grau1" />
            <label htmlFor="grau1" className="text-xs text-gray-600">
              Equação de 1º Grau
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">Resolva a equação:</p>
        
        <div className="text-lg font-medium text-center mb-6">
          3(2nx-6)-2(4nx-8)+2((n+1)x-3n+2)=0
        </div>
        
        <div className="mb-6">
          <label className="text-xs text-gray-600 block mb-2">
            Número da licença (Digite o valor que você atribui ao "n"):
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
        </div>
        
        <div className="bg-gray-100 p-3 rounded-md mb-4">
          <p className="text-xs text-gray-600">
            <strong>RESPOSTA:</strong> Para determinar o número n (nesse caso use números inteiros, utilize QUATRO casas decimais)
          </p>
        </div>
        
        <Button className="w-full bg-totalBlue hover:bg-blue-900">
          ENVIAR
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyExerciseSection;
