import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ArrowRight, Brain, BarChart, Users } from 'lucide-react';

type Step = 'lead' | 'quiz' | 'result';

type TestQuestion = {
  id: number;
  enunciado: string;
  alternativas: string[];
  respostaCorretaIndex: number;
};

const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    enunciado: 'Quanto é 7 × 8?',
    alternativas: ['48', '54', '56', '64'],
    respostaCorretaIndex: 2,
  },
  {
    id: 2,
    enunciado: 'Qual número completa a sequência? 5, 10, 15, ___, 25',
    alternativas: ['18', '20', '22', '24'],
    respostaCorretaIndex: 1,
  },
  {
    id: 3,
    enunciado: '1/2 é equivalente a:',
    alternativas: ['2/6', '3/8', '2/4', '4/6'],
    respostaCorretaIndex: 2,
  },
  {
    id: 4,
    enunciado: 'Qual é o resultado de 15 + 28?',
    alternativas: ['33', '43', '42', '53'],
    respostaCorretaIndex: 1,
  },
  {
    id: 5,
    enunciado: '100 ÷ 4 = ?',
    alternativas: ['20', '25', '30', '40'],
    respostaCorretaIndex: 1,
  },
];

const FacaUmTeste = () => {
  const navigate = useNavigate();
  
  // Step state
  const [step, setStep] = useState<Step>('lead');
  
  // Lead form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('');
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  
  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: number; correct: boolean }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleStartTest = async () => {
    setLeadError(null);

    if (!nome.trim() || !email.trim() || !tipoPerfil.trim()) {
      setLeadError('Preencha nome, e-mail e selecione seu perfil.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLeadError('Informe um e-mail válido.');
      return;
    }

    setLeadLoading(true);

    const { error } = await supabase
      .from('leads')
      .insert({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        escola_ou_rede: tipoPerfil,
        origem: 'faca-um-teste',
      });

    if (error) {
      console.error('[FacaUmTeste]', 'lead-insert-error', error);
      setLeadError('Não foi possível iniciar o teste agora. Tente novamente em alguns instantes.');
      setLeadLoading(false);
      return;
    }

    console.log('[FacaUmTeste]', 'lead-insert-success', { email });
    toast.success('Obrigado! Agora veja como o aluno da sua escola utilizaria o Total Matemática.');
    setLeadLoading(false);
    setStep('quiz');
  };

  const handleSelectOption = (index: number) => {
    if (showFeedback) return;
    setSelectedOptionIndex(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionIndex === null) {
      toast.error('Selecione uma alternativa antes de continuar.');
      return;
    }

    const currentQuestion = TEST_QUESTIONS[currentIndex];
    const isCorrect = selectedOptionIndex === currentQuestion.respostaCorretaIndex;
    
    setAnswers([...answers, { questionId: currentQuestion.id, correct: isCorrect }]);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentIndex < TEST_QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOptionIndex(null);
        setShowFeedback(false);
      } else {
        setStep('result');
      }
    }, 1500);
  };

  const handleContactTeam = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('lead-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const totalQuestions = TEST_QUESTIONS.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const currentQuestion = TEST_QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          
          {/* Step 1: Lead Form */}
          {step === 'lead' && (
            <Card className="shadow-lg">
              <CardHeader className="text-center bg-totalBlue text-white rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl">Faça um Teste Gratuito</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Veja como funciona o Total Matemática na prática
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <p className="text-gray-600 mb-6 text-center">
                  Preencha seus dados para iniciar o teste e conhecer a experiência que seus alunos terão.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tipoPerfil">Você é? *</Label>
                    <Select value={tipoPerfil} onValueChange={setTipoPerfil}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direção">Direção</SelectItem>
                        <SelectItem value="Coordenação">Coordenação</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Responsável">Responsável</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {leadError && (
                    <p className="text-red-500 text-sm">{leadError}</p>
                  )}
                  
                  <Button 
                    onClick={handleStartTest} 
                    disabled={leadLoading}
                    className="w-full bg-totalYellow text-totalBlue hover:bg-yellow-400 font-semibold text-lg py-6"
                  >
                    {leadLoading ? 'Iniciando...' : 'Começar Teste'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Quiz */}
          {step === 'quiz' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Questão {currentIndex + 1} de {totalQuestions}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-totalBlue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-xl text-totalBlue">
                    {currentQuestion.enunciado}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {currentQuestion.alternativas.map((alt, index) => {
                      const isSelected = selectedOptionIndex === index;
                      const isCorrect = index === currentQuestion.respostaCorretaIndex;
                      
                      let cardClass = 'border-2 p-4 rounded-lg cursor-pointer transition-all duration-200 ';
                      
                      if (showFeedback) {
                        if (isCorrect) {
                          cardClass += 'border-green-500 bg-green-50';
                        } else if (isSelected && !isCorrect) {
                          cardClass += 'border-red-500 bg-red-50';
                        } else {
                          cardClass += 'border-gray-200 opacity-50';
                        }
                      } else {
                        cardClass += isSelected 
                          ? 'border-totalBlue bg-blue-50' 
                          : 'border-gray-200 hover:border-totalBlue hover:bg-blue-50';
                      }

                      return (
                        <div
                          key={index}
                          className={cardClass}
                          onClick={() => handleSelectOption(index)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {String.fromCharCode(65 + index)}) {alt}
                            </span>
                            {showFeedback && isCorrect && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {showFeedback && isSelected && !isCorrect && (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!showFeedback && (
                    <Button 
                      onClick={handleConfirmAnswer}
                      className="w-full mt-6 bg-totalBlue hover:bg-blue-700"
                      disabled={selectedOptionIndex === null}
                    >
                      Responder e Continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}

                  {showFeedback && (
                    <p className="text-center mt-4 text-gray-500">
                      {currentIndex < TEST_QUESTIONS.length - 1 
                        ? 'Avançando para a próxima questão...' 
                        : 'Calculando seu resultado...'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <div className="space-y-8">
              <Card className="shadow-lg text-center">
                <CardHeader className="bg-totalBlue text-white rounded-t-lg py-8">
                  <CardTitle className="text-3xl md:text-4xl">
                    Você acertou {correctCount} de {totalQuestions}
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg mt-2">
                    {correctCount === totalQuestions 
                      ? 'Parabéns! Desempenho excelente!' 
                      : correctCount >= totalQuestions / 2 
                        ? 'Bom trabalho!' 
                        : 'Continue praticando!'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-left mb-6">
                    <h3 className="font-semibold text-lg text-amber-800 mb-3">
                      💡 Na sua escola, isso seria diferente...
                    </h3>
                    <p className="text-amber-700">
                      Em uma implementação real do Total Matemática na sua escola, cada uma dessas respostas 
                      alimentaria relatórios automáticos para professores, coordenação e direção. 
                      Isso permite que a sua equipe identifique rapidamente quem precisa de apoio em cada turma, 
                      sem aumentar a carga de trabalho dos professores.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <BarChart className="h-8 w-8 text-totalBlue mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Relatórios para a gestão</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Users className="h-8 w-8 text-totalBlue mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Dados por turma e aluno</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Brain className="h-8 w-8 text-totalBlue mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Identificação de lacunas</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleContactTeam}
                    className="w-full bg-totalYellow text-totalBlue hover:bg-yellow-400 font-semibold text-lg py-6"
                  >
                    Falar com Nossa Equipe
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FacaUmTeste;
