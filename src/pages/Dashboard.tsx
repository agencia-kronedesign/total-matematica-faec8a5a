
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Bell, BookOpen, Award, User, MessageSquare, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';

// Dados de exemplo para o gráfico
const evolucaoData = [
  { name: 'Jan', pontos: 50, turma: 120 },
  { name: 'Fev', pontos: 80, turma: 240 },
  { name: 'Mar', pontos: 120, turma: 180 },
  { name: 'Abr', pontos: 160, turma: 200 },
  { name: 'Mai', pontos: 180, turma: 280 },
  { name: 'Jun', pontos: 210, turma: 380 },
  { name: 'Jul', pontos: 250, turma: 320 },
  { name: 'Ago', pontos: 300, turma: 250 },
  { name: 'Set', pontos: 350, turma: 260 },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [resposta, setResposta] = useState('');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <Header />

        <main className="p-6">
          {/* Greeting Section */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-gray-700">
              Olá, {user?.user_metadata?.nome || 'Estudante'}. Algumas novidades chegaram...
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Card 1 - Mensagens */}
              <div className="flex border-l-4 border-totalBlue p-4 bg-gray-50 rounded-r-lg">
                <div className="mr-4 flex flex-col items-center">
                  <div className="w-8 h-8 bg-totalBlue rounded-full flex items-center justify-center text-white">
                    <MessageSquare size={18} />
                  </div>
                  <div className="h-full w-0.5 bg-blue-100 my-2"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Mensagens</h3>
                  <p className="text-gray-600 mb-2">Parabéns pelo seu aniversário!</p>
                  <a href="#" className="text-totalBlue hover:underline text-sm font-medium">
                    Ver todas as mensagens
                  </a>
                </div>
              </div>

              {/* Card 2 - Professora */}
              <div className="flex border-l-4 border-totalBlue p-4 bg-gray-50 rounded-r-lg">
                <div className="mr-4 flex flex-col items-center">
                  <div className="w-8 h-8 bg-totalBlue rounded-full flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <div className="h-full w-0.5 bg-blue-100 my-2"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Professora</h3>
                  <p className="text-gray-600 mb-2">Parabéns! Você está entre os melhores da sua escola!</p>
                  <a href="#" className="text-totalBlue hover:underline text-sm font-medium">
                    Ver mais informações
                  </a>
                </div>
              </div>

              {/* Card 3 - Exercícios */}
              <div className="flex border-l-4 border-totalBlue p-4 bg-gray-50 rounded-r-lg">
                <div className="mr-4 flex flex-col items-center">
                  <div className="w-8 h-8 bg-totalBlue rounded-full flex items-center justify-center text-white">
                    <BookOpen size={18} />
                  </div>
                  <div className="h-full w-0.5 bg-blue-100 my-2"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Exercícios</h3>
                  <p className="text-gray-600 mb-2">Chegou uma nova tarefa de Geometria</p>
                  <a href="#" className="text-totalBlue hover:underline text-sm font-medium">
                    Fazer agora!
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Exercício do Dia */}
            <Card className="lg:col-span-1">
              <CardHeader className="bg-white pb-2">
                <CardTitle className="text-xl text-totalBlue font-bold">
                  EXERCÍCIO DO DIA
                </CardTitle>
                <Badge className="bg-gray-200 text-gray-700 font-normal">Equação do 1º Grau</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2">Resolva a equação:</p>
                    <p className="text-gray-900 font-medium">3(2nx-6)-2(4nx + 8) + 2[(n + 1)x - 3n + 2]= 0</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Número da chamada: (Digite o valor que você atribui ao "n")</p>
                    <Input 
                      className="mt-1 border-b-2 border-totalBlue" 
                      value={resposta}
                      onChange={(e) => setResposta(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium">RESPOSTA:</p>
                    <p className="text-xs text-gray-500">(Se NÃO for um número inteiro, utilize QUATRO casas decimais)</p>
                  </div>

                  <Button className="w-full bg-totalBlue hover:bg-blue-800">ENVIAR</Button>
                </div>
              </CardContent>
            </Card>

            {/* Minha Evolução */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold">MINHA EVOLUÇÃO</CardTitle>
                  <Tabs defaultValue="eu" className="w-auto">
                    <TabsList className="bg-gray-100 h-7 p-1">
                      <TabsTrigger value="eu" className="text-xs h-5 px-2">Eu</TabsTrigger>
                      <TabsTrigger value="minha-escola" className="text-xs h-5 px-2">Minha escola</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={evolucaoData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="pontos" 
                        stroke="#0000FF" 
                        activeDot={{ r: 6 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="turma" 
                        stroke="#CCCCCC" 
                        strokeWidth={2}
                        dot={{ stroke: '#CCCCCC', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Minhas Medalhas */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-bold">MINHAS MEDALHAS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Medalha 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                      <Award size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase text-blue-900">SÃO 23 DIAS SEGUIDOS</h3>
                      <p className="text-sm text-gray-500">Faltam 7 dias para a próxima medalha</p>
                    </div>
                  </div>

                  {/* Medalha 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase text-blue-900">EQUAÇÕES DO 1º GRAU</h3>
                      <p className="text-sm text-gray-500">Mais detalhes</p>
                    </div>
                  </div>

                  {/* Medalha 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                      <Award size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold uppercase text-blue-900">MEDALHA DE OURO 1º ANO E.M. COMPLETO</h3>
                      <p className="text-sm text-gray-500">Faltam 5 exercícios para a próxima medalha</p>
                    </div>
                  </div>

                  <Button className="w-full bg-totalBlue hover:bg-blue-800">MAIS EXERCÍCIOS</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
