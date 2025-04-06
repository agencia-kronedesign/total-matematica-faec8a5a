
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotificationsSection = () => {
  const notifications = [
    {
      id: 1,
      type: 'messages',
      title: 'Mensagens',
      content: 'Parabéns pelo seu aniversário!',
      icon: <MessageSquare className="h-6 w-6 text-totalBlue" />,
      action: 'Ver todas as mensagens',
      actionLink: '/mensagens',
      iconBg: 'bg-blue-100',
    },
    {
      id: 2,
      type: 'professors',
      title: 'Professores',
      content: 'Parabéns! Você está entre os melhores da sua escola!',
      icon: <Users className="h-6 w-6 text-totalBlue" />,
      action: 'Ver mais informações',
      actionLink: '/professores',
      iconBg: 'bg-blue-100',
    },
    {
      id: 3,
      type: 'exercises',
      title: 'Exercícios',
      content: 'Chegou uma nova Lição de Geometria',
      icon: <BookOpen className="h-6 w-6 text-totalBlue" />,
      action: 'Fazer agora!',
      actionLink: '/exercicios/novo',
      iconBg: 'bg-blue-100',
    },
  ];

  return (
    <>
      {notifications.map((notification) => (
        <Card key={notification.id} className="overflow-hidden">
          <CardHeader className="pb-3 relative flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${notification.iconBg}`}>
                {notification.icon}
              </div>
              <CardTitle className="text-base font-medium">{notification.title}</CardTitle>
            </div>
            <div className="h-full w-1 bg-totalBlue absolute top-0 left-0" />
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{notification.content}</p>
            <Link to={notification.actionLink}>
              <Button
                variant="link"
                className="p-0 h-auto text-totalBlue font-medium text-sm"
              >
                {notification.action}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default NotificationsSection;
