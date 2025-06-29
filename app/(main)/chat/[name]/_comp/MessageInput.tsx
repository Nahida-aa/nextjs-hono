'use client'
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { CirclePlus, Smile } from 'lucide-react';
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [content, setContent] = useState('');

  const handleSendMessage = () => {
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };
  return (
    <div className="flex items-center gap-2 ">
      <Input
        type="text"
        className=" bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
        placeholder="Enter message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage();
          }
        }}
      />
      {content==='' ? <><Smile className='opacity-80' /> <CirclePlus className='opacity-80' /></> : <Button
        className="h-[1.875rem] p-2"
        disabled={content===''}
        onClick={handleSendMessage}
      >
        send
      </Button>}
      
    </div>
  );
};
