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
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { CrystalLogo } from '../icons';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import type { Conversation } from '../../types';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { conversations, currentConversation, createConversation, deleteConversation } = useChatStore();
  const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();
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
        'flex flex-col h-screen bg-void-900/70 border-r border-void-700/50',
        'transition-all duration-300 ease-out backdrop-blur-sm',
        isSidebarCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-void-700/50">
        {!isSidebarCollapsed && (
          <Link to="/" className="flex items-center gap-3 group">
            <div className="logo-crystal w-10 h-10 bg-void-900/80 rounded-xl p-1 
                          shadow-glow transition-all duration-300 group-hover:shadow-glow-lg">
              <CrystalLogo size={32} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-void-50 text-lg tracking-wider">
                NeoChat
              </span>
              <span className="text-[10px] text-void-400 tracking-wide -mt-0.5">
                by Neo Olympus
              </span>
            </div>
          </Link>
        )}
        {isSidebarCollapsed && (
          <div className="logo-crystal w-10 h-10 bg-void-900/80 rounded-xl p-1 shadow-glow mx-auto">
            <CrystalLogo size={32} />
          </div>
        )}
        <button
          onClick={toggleSidebarCollapse}
          className={clsx(
            'p-2 text-void-400 hover:text-crystal-400 hover:bg-void-800/50',
            'rounded-lg transition-colors',
            isSidebarCollapsed && 'hidden lg:block absolute right-2'
          )}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="primary"
          className={clsx('w-full', isSidebarCollapsed && 'px-2')}
          onClick={handleNewChat}
          isLoading={isCreating}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {!isSidebarCollapsed && 'New Chat'}
        </Button>
      </div>

      {/* Search */}
      {!isSidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-void-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-void-800/50 border border-void-700/50 
                       rounded-lg text-sm text-void-200 placeholder:text-void-500
                       focus:outline-none focus:border-crystal-500/50 transition-colors"
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
          <div className="text-center py-8 text-void-500 text-sm">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-void-700/50">
        {!isSidebarCollapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crystal-500 to-crystal-700 
                          flex items-center justify-center text-void-950 font-semibold text-sm
                          shadow-glow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-void-200 truncate">{user.name}</p>
              <p className="text-xs text-void-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className={clsx('flex gap-2', isSidebarCollapsed && 'flex-col')}>
          <Button
            variant="ghost"
            size="sm"
            className={clsx('flex-1', isSidebarCollapsed && 'px-2')}
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4" />
            {!isSidebarCollapsed && 'Settings'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={clsx('flex-1', isSidebarCollapsed && 'px-2')}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && 'Logout'}
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
          ? 'bg-crystal-500/10 border border-crystal-500/30 text-void-100'
          : 'hover:bg-void-800/50 text-void-300 hover:text-void-100 border border-transparent'
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <MessageSquare className={clsx('w-4 h-4 flex-shrink-0', isActive && 'text-crystal-400')} />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm truncate">{conversation.title || 'New Chat'}</span>
          
          {showDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-void-500 hover:text-red-400 hover:bg-red-500/10 
                       rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </Link>
  );
}
