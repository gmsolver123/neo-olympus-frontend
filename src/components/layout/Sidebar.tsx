import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { Conversation } from '../../types';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { conversations, currentConversation, createConversation, deleteConversation } = useChatStore();
  const { isSidebarCollapsed, toggleSidebarCollapse, setSidebarOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const conversation = await createConversation();
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteConversation(id);
    if (currentConversation?.id === id) {
      navigate('/chat');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]',
        'transition-all duration-300 ease-out',
        isSidebarCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        {!isSidebarCollapsed && (
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-semibold text-[var(--color-text-primary)]">
              Neo Olympus
            </span>
          </Link>
        )}
        {isSidebarCollapsed && (
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
        )}
        <div className="flex items-center gap-1">
          {/* Close button - only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
                     hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Collapse button - only on desktop */}
          <button
            onClick={toggleSidebarCollapse}
            className={clsx(
              'p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors hidden lg:block',
              isSidebarCollapsed && 'absolute right-2'
            )}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="secondary"
          className={clsx('w-full justify-start', isSidebarCollapsed && 'px-2 justify-center')}
          onClick={handleNewChat}
          isLoading={isCreating}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {!isSidebarCollapsed && 'New chat'}
        </Button>
      </div>

      {/* Search */}
      {!isSidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] 
                       rounded-lg text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]
                       focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={currentConversation?.id === conversation.id}
            isCollapsed={isSidebarCollapsed}
            onDelete={(e) => handleDeleteConversation(e, conversation.id)}
          />
        ))}

        {filteredConversations.length === 0 && !isSidebarCollapsed && (
          <div className="text-center py-8 text-[var(--color-text-tertiary)] text-sm">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-[var(--color-border)]">
        {!isSidebarCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] 
                            flex items-center justify-center text-white font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className={clsx('flex gap-2', isSidebarCollapsed ? 'flex-col' : 'flex-row')}>
          <ThemeToggle className={isSidebarCollapsed ? '' : ''} />
          <Button
            variant="ghost"
            size="sm"
            className={clsx('whitespace-nowrap', isSidebarCollapsed && 'px-2 justify-center')}
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4" />
            {!isSidebarCollapsed && <span className="ml-1">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={clsx('whitespace-nowrap', isSidebarCollapsed && 'px-2 justify-center')}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && <span className="ml-1">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isCollapsed: boolean;
  onDelete: (e: React.MouseEvent) => void;
}

function ConversationItem({ conversation, isActive, isCollapsed, onDelete }: ConversationItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <Link
      to={`/chat/${conversation.id}`}
      className={clsx(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg',
        'transition-all duration-150 group',
        isActive
          ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
          : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0" />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm truncate">{conversation.title || 'New Chat'}</span>
          
          {showDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] 
                       hover:bg-[var(--color-error-light)] rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </Link>
  );
}
