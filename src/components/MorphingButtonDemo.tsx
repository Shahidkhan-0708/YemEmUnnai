import React from 'react';
import { MorphingButton } from './original';
import { toast } from './ui/sonner';

const MorphingButtonDemo: React.FC = () => {
  const handleNotify = (email: string) => {
    console.log('Notification requested for:', email);
    toast.success(`Success! You'll be notified at ${email}`);
  };

  return <MorphingButton buttonText="Notify Me" onSubmit={handleNotify} />;
};

export default MorphingButtonDemo;
