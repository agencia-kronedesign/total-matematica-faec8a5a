import React, { useState, useEffect } from 'react';
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
import { CheckCircle, XCircle, ArrowRight, Brain, BarChart, Users, Loader2, AlertCircle } from 'lucide-react';
import { SafeMathEvaluator } from '@/utils/safeMathEvaluator';

type Step = 'lead' | 'quiz' | 'result';

type ExercicioDemo = {
  id: string;
  formula: string;
  margem_erro: number;
  imagem_url: string | null;
  n: number;
  respostaEsperada: number;
};

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
  
  // Quiz state - exercícios reais
  const [exercicios, setExercicios] = useState<ExercicioDemo[]>([]);
  const [loadingExercicios, setLoadingExercicios] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resposta, setResposta] = useState('');
  const [answers, setAnswers] = useState<{ exercicioId: string; correct: boolean; esperado: number; digitado: number }[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

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
      .from('leads_teste')
      .insert({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        tipo_perfil: tipoPerfil,
        origem: 'FAÇA UM TESTE',
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
    
    // Carregar exercícios reais
    await carregarExercicios();
  };

  const carregarExercicios = async () => {
    setLoadingExercicios(true);
    
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('id, formula, margem_erro, imagem_url')
        .eq('exemplo_teste_publico', true)
        .eq('ativo', true)
        .limit(3);

      if (error) {
        console.error('[FacaUmTeste]', 'fetch-exercicios-error', error);
        setExercicios([]);
        setStep('quiz');
        return;
      }

      if (!data || data.length === 0) {
        setExercicios([]);
        setStep('quiz');
        return;
      }

      // Gerar N aleatório para cada exercício e calcular resposta esperada
      const exerciciosComN: ExercicioDemo[] = data
        .filter(ex => ex.formula && SafeMathEvaluator.isValidFormula(ex.formula))
        .map(ex => {
          const n = Math.floor(Math.random() * 20) + 1; // N entre 1 e 20
          let respostaEsperada = 0;
          try {
            respostaEsperada = SafeMathEvaluator.evaluate(ex.formula!, n);
          } catch (e) {
            console.error('Erro ao calcular fórmula:', e);
          }
          return {
            id: ex.id,
            formula: ex.formula!,
            margem_erro: ex.margem_erro || 0,
            imagem_url: ex.imagem_url,
            n,
            respostaEsperada: Math.round(respostaEsperada * 100) / 100, // 2 casas decimais
          };
        });

      setExercicios(exerciciosComN);
      setStep('quiz');
    } catch (err) {
      console.error('[FacaUmTeste]', 'fetch-exercicios-catch', err);
      setExercicios([]);
      setStep('quiz');
    } finally {
      setLoadingExercicios(false);
    }
  };

  const handleConfirmAnswer = () => {
    if (!resposta.trim()) {
      toast.error('Digite sua resposta antes de continuar.');
      return;
    }

    const currentExercicio = exercicios[currentIndex];
    const respostaDigitada = parseFloat(resposta.replace(',', '.'));
    
    if (isNaN(respostaDigitada)) {
      toast.error('Digite um número válido.');
      return;
    }

    const diferenca = Math.abs(respostaDigitada - currentExercicio.respostaEsperada);
    const isCorrect = diferenca <= currentExercicio.margem_erro;
    
    setAnswers([...answers, { 
      exercicioId: currentExercicio.id, 
      correct: isCorrect,
      esperado: currentExercicio.respostaEsperada,
      digitado: respostaDigitada
    }]);
    setFeedbackCorrect(isCorrect);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentIndex < exercicios.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setResposta('');
        setShowFeedback(false);
      } else {
        setStep('result');
      }
    }, 2000);
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

  const totalQuestions = exercicios.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const currentExercicio = exercicios[currentIndex];

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
                    disabled={leadLoading || loadingExercicios}
                    className="w-full bg-totalYellow text-totalBlue hover:bg-yellow-400 font-semibold text-lg py-6"
                  >
                    {leadLoading || loadingExercicios ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        Começar Teste
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Quiz */}
          {step === 'quiz' && (
            <div className="space-y-6">
              {exercicios.length === 0 ? (
                // Fallback quando não há exercícios de exemplo
                <Card className="shadow-lg">
                  <CardHeader className="bg-amber-50">
                    <CardTitle className="text-xl text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      Demonstração em Configuração
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      No momento, não há exercícios de demonstração configurados pelo administrador.
                    </p>
                    <p className="text-gray-600 mb-6">
                      Mas não se preocupe! O Total Matemática oferece centenas de exercícios 
                      organizados por nível de dificuldade, todos acompanhados de relatórios 
                      detalhados para professores e gestão escolar.
                    </p>
                    <Button 
                      onClick={handleContactTeam}
                      className="w-full bg-totalYellow text-totalBlue hover:bg-yellow-400 font-semibold"
                    >
                      Falar com Nossa Equipe
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-500">
                      Exercício {currentIndex + 1} de {totalQuestions}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-totalBlue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Você está respondendo exercícios reais da plataforma Total Matemática
                    </p>
                  </div>

                  <Card className="shadow-lg">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-xl text-totalBlue">
                        Usando N = {currentExercicio?.n}, calcule o resultado:
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {currentExercicio?.imagem_url && (
                        <div className="mb-4 flex justify-center">
                          <img 
                            src={currentExercicio.imagem_url} 
                            alt="Exercício" 
                            className="max-w-full max-h-64 rounded-lg shadow"
                          />
                        </div>
                      )}

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-500 mb-1">Fórmula:</p>
                        <p className="font-mono text-lg">{currentExercicio?.formula}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Substitua <span className="font-bold">n</span> por <span className="font-bold text-totalBlue">{currentExercicio?.n}</span> e calcule.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="resposta">Sua resposta:</Label>
                          <Input
                            id="resposta"
                            type="text"
                            value={resposta}
                            onChange={(e) => setResposta(e.target.value)}
                            placeholder="Digite o resultado"
                            className="mt-1 text-lg"
                            disabled={showFeedback}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !showFeedback) {
                                handleConfirmAnswer();
                              }
                            }}
                          />
                        </div>

                        {showFeedback && (
                          <div className={`p-4 rounded-lg flex items-center gap-3 ${
                            feedbackCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                          }`}>
                            {feedbackCorrect ? (
                              <>
                                <CheckCircle className="h-6 w-6 text-green-600" />
                                <span className="font-medium">Correto! Muito bem!</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-6 w-6 text-red-600" />
                                <span className="font-medium">
                                  Resposta esperada: {currentExercicio?.respostaEsperada}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {!showFeedback && (
                          <Button 
                            onClick={handleConfirmAnswer}
                            className="w-full bg-totalBlue hover:bg-blue-700"
                            disabled={!resposta.trim()}
                          >
                            Responder e Continuar
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        )}

                        {showFeedback && (
                          <p className="text-center text-gray-500">
                            {currentIndex < exercicios.length - 1 
                              ? 'Avançando para o próximo exercício...' 
                              : 'Calculando seu resultado...'}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
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
