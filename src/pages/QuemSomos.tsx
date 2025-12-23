import { BarChart, Users, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuemSomos = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    navigate("/");
    setTimeout(() => {
      const leadForm = document.getElementById("lead-form");
      if (leadForm) {
        leadForm.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const beneficios = [
    {
      icon: BarChart,
      titulo: "Para a Gestão",
      descricao:
        "Visão clara da aprendizagem. Acompanhe em poucos cliques quais turmas estão evoluindo e onde agir antes do conselho de classe.",
    },
    {
      icon: Users,
      titulo: "Para os Professores",
      descricao:
        "Menos tempo corrigindo, mais tempo ensinando. Relatórios automáticos por aluno e turma que mostram exatamente onde estão as lacunas.",
    },
    {
      icon: Brain,
      titulo: "Para os Alunos",
      descricao:
        "Mais segurança e autonomia. Feedback imediato que transforma o erro em oportunidade de aprendizado.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-totalBlue py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Sua escola com menos preocupação e mais segurança pedagógica.
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            O Total Matemática transforma o desafio do ensino da matemática em
            dados claros para a sua gestão e resultados reais para seus alunos.
          </p>
        </div>
      </section>

      {/* Seção: O que sua escola ganha */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            O que sua escola ganha
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {beneficios.map((beneficio, index) => {
              const Icon = beneficio.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-totalYellow/30 hover:border-totalYellow transition-colors"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-totalYellow/20 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-totalBlue" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {beneficio.titulo}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {beneficio.descricao}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção: Metodologia e Confiança */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Metodologia e Confiança
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sua escola ganha um aliado que fortalece o raciocínio lógico e a
            organização pedagógica, com registros contínuos que facilitam
            reuniões de pais e planejamentos de reforço.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-totalYellow">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-totalBlue mb-6">
            Pronto para elevar o nível da sua escola?
          </h2>
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="bg-totalBlue text-white hover:bg-totalBlue/90 text-lg px-8 py-6"
          >
            FALAR COM NOSSA EQUIPE
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuemSomos;
