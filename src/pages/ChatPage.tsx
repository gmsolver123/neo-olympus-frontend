import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout, Header } from '../components/layout';
import { ChatInput, MessageList, EmptyState } from '../components/chat';
import { useChatStore } from '../store/chatStore';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { 
    currentConversation, 
    messages, 
    selectConversation, 
    clearCurrentConversation,
    fetchConversations 
  } = useChatStore();

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    } else {
      clearCurrentConversation();
    }
  }, [conversationId, selectConversation, clearCurrentConversation]);

  const hasMessages = messages.length > 0;

  return (
    <MainLayout>
      <Header title={currentConversation?.title || 'New Chat'} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {hasMessages ? (
          <>
            <MessageList />
            <ChatInput />
          </>
        ) : conversationId ? (
          <>
            <MessageList />
            <ChatInput />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </MainLayout>
  );
}
