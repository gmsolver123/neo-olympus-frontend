import type { User, RawUser, Conversation, Message } from '../types';

// Mock User - matches backend User schema (without computed name)
export const mockUser: RawUser = {
  id: 'user-1',
  email: 'demo@neo-olympus.ai',
  full_name: 'Demo User',
  bio: null,
  is_active: true,
  plan: 'free',
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    user_id: 'user-1',
    title: 'Help me write Python code',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:45:00Z',
    message_count: 4,
    last_message_preview: 'Here\'s the optimized version of your code...',
  },
  {
    id: 'conv-2',
    user_id: 'user-1',
    title: 'Image analysis request',
    created_at: '2024-01-14T08:00:00Z',
    updated_at: '2024-01-14T08:30:00Z',
    message_count: 2,
    last_message_preview: 'The image shows a beautiful mountain landscape...',
  },
  {
    id: 'conv-3',
    user_id: 'user-1',
    title: 'Explain quantum computing',
    created_at: '2024-01-12T15:00:00Z',
    updated_at: '2024-01-12T15:45:00Z',
    message_count: 6,
    last_message_preview: 'Quantum computing uses quantum mechanics principles...',
  },
  {
    id: 'conv-4',
    user_id: 'user-1',
    title: 'Recipe suggestions',
    created_at: '2024-01-10T19:00:00Z',
    updated_at: '2024-01-10T19:20:00Z',
    message_count: 3,
    last_message_preview: 'Here are some delicious dinner ideas...',
  },
];

// Mock Messages for conv-1
export const mockMessagesConv1: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    role: 'user',
    content: [{ type: 'text', text: 'Can you help me write a Python function to sort a list of dictionaries by a specific key?' }],
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    role: 'assistant',
    content: [{ 
      type: 'text', 
      text: `Of course! Here's a Python function that sorts a list of dictionaries by a specific key:

\`\`\`python
def sort_by_key(data: list[dict], key: str, reverse: bool = False) -> list[dict]:
    """
    Sort a list of dictionaries by a specific key.
    
    Args:
        data: List of dictionaries to sort
        key: The dictionary key to sort by
        reverse: If True, sort in descending order
    
    Returns:
        Sorted list of dictionaries
    """
    return sorted(data, key=lambda x: x.get(key, ''), reverse=reverse)

# Example usage:
users = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35}
]

sorted_users = sort_by_key(users, "age")
print(sorted_users)
# Output: [{"name": "Bob", "age": 25}, {"name": "Alice", "age": 30}, {"name": "Charlie", "age": 35}]
\`\`\`

This function uses Python's built-in \`sorted()\` with a lambda function as the key. Would you like me to add any additional features?`
    }],
    model_used: 'gpt-4o',
    tokens_input: 45,
    tokens_output: 230,
    latency_ms: 1250,
    created_at: '2024-01-15T10:30:30Z',
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1',
    role: 'user',
    content: [{ type: 'text', text: 'Can you make it handle nested keys, like sorting by user.profile.age?' }],
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-1',
    role: 'assistant',
    content: [{
      type: 'text',
      text: `Great idea! Here's an enhanced version that supports nested keys using dot notation:

\`\`\`python
from typing import Any
from functools import reduce

def get_nested_value(data: dict, keys: str, default: Any = None) -> Any:
    """Get a value from a nested dictionary using dot notation."""
    try:
        return reduce(lambda d, key: d[key], keys.split('.'), data)
    except (KeyError, TypeError):
        return default

def sort_by_key(data: list[dict], key: str, reverse: bool = False) -> list[dict]:
    """
    Sort a list of dictionaries by a specific key (supports nested keys).
    
    Args:
        data: List of dictionaries to sort
        key: The dictionary key to sort by (supports dot notation for nested keys)
        reverse: If True, sort in descending order
    
    Returns:
        Sorted list of dictionaries
    """
    return sorted(data, key=lambda x: get_nested_value(x, key, ''), reverse=reverse)

# Example with nested keys:
users = [
    {"name": "Alice", "profile": {"age": 30, "city": "NYC"}},
    {"name": "Bob", "profile": {"age": 25, "city": "LA"}},
    {"name": "Charlie", "profile": {"age": 35, "city": "Chicago"}}
]

sorted_users = sort_by_key(users, "profile.age")
print(sorted_users)
\`\`\`

Now you can sort by any nested key using dot notation! 🎉`
    }],
    model_used: 'claude-3-5-sonnet',
    tokens_input: 280,
    tokens_output: 320,
    latency_ms: 1800,
    created_at: '2024-01-15T11:00:45Z',
  },
];

// Mock Messages for conv-2 (with image)
export const mockMessagesConv2: Message[] = [
  {
    id: 'msg-5',
    conversation_id: 'conv-2',
    role: 'user',
    content: [
      { type: 'text', text: 'What can you tell me about this image?' },
      { 
        type: 'image', 
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        filename: 'mountain.jpg',
        mime_type: 'image/jpeg'
      }
    ],
    created_at: '2024-01-14T08:00:00Z',
  },
  {
    id: 'msg-6',
    conversation_id: 'conv-2',
    role: 'assistant',
    content: [{
      type: 'text',
      text: `This is a stunning photograph of a mountain landscape! Here's what I can see:

**Scene Description:**
- A majestic snow-capped mountain peak rising above clouds
- The mountain appears to be part of an alpine range, possibly the Alps or Dolomites
- Beautiful golden hour lighting casting warm tones on the peaks

**Key Features:**
- 🏔️ Sharp, dramatic rock formations with glacial snow
- ☁️ Sea of clouds below the summit
- 🌅 Warm sunset/sunrise lighting
- Clear blue sky in the upper portion

**Photography Notes:**
- Excellent composition with the peak as the focal point
- Professional-quality landscape photography
- High dynamic range capturing both shadows and highlights

This type of landscape is perfect for travel photography or as a desktop wallpaper. Would you like me to analyze any specific aspect in more detail?`
    }],
    model_used: 'gpt-4o-vision',
    tokens_input: 1200,
    tokens_output: 180,
    latency_ms: 2100,
    created_at: '2024-01-14T08:00:45Z',
  },
];

// Mock Messages for conv-3
export const mockMessagesConv3: Message[] = [
  {
    id: 'msg-7',
    conversation_id: 'conv-3',
    role: 'user',
    content: [{ type: 'text', text: 'Can you explain quantum computing in simple terms?' }],
    created_at: '2024-01-12T15:00:00Z',
  },
  {
    id: 'msg-8',
    conversation_id: 'conv-3',
    role: 'assistant',
    content: [{
      type: 'text',
      text: `# Quantum Computing Explained Simply 🔬

Think of quantum computing like this:

## Classical Computers (What You Use Now)
- Work with **bits** that are either 0 OR 1
- Like a light switch: on or off
- Process one calculation at a time

## Quantum Computers
- Work with **qubits** that can be 0 AND 1 simultaneously
- Like a coin spinning in the air (both heads AND tails until it lands)
- Can process many calculations at once!

## Why This Matters

| Task | Classical | Quantum |
|------|-----------|---------|
| Breaking encryption | Millions of years | Hours |
| Drug discovery | Decades | Months |
| Weather prediction | Days | Minutes |

## The Catch
- Qubits are fragile (need extreme cold: -459°F)
- Prone to errors
- Very expensive ($10-15 million per machine)
- Only useful for specific problems

## Current State
Companies like IBM, Google, and Microsoft are racing to build practical quantum computers. Google claimed "quantum supremacy" in 2019 by solving a problem in 200 seconds that would take a supercomputer 10,000 years!

Want me to dive deeper into any aspect?`
    }],
    model_used: 'claude-3-5-sonnet',
    tokens_input: 25,
    tokens_output: 280,
    latency_ms: 1650,
    created_at: '2024-01-12T15:01:00Z',
  },
];

// Map of conversation IDs to their messages
export const mockMessagesByConversation: Record<string, Message[]> = {
  'conv-1': mockMessagesConv1,
  'conv-2': mockMessagesConv2,
  'conv-3': mockMessagesConv3,
  'conv-4': [], // Empty conversation
};

// AI Response templates for demo
export const mockAIResponses: string[] = [
  "That's a great question! Let me think about this...\n\nBased on your query, here are my thoughts:\n\n1. **First consideration**: The context you've provided is helpful.\n2. **Second point**: There are multiple approaches we could take.\n3. **Recommendation**: I'd suggest starting with the simplest solution.\n\nWould you like me to elaborate on any of these points?",
  
  "I'd be happy to help with that! 🎯\n\nHere's what I understand from your request:\n- You're looking for a practical solution\n- The context is important for getting this right\n\nLet me provide a detailed response that addresses your specific needs. Feel free to ask follow-up questions!",
  
  "Excellent question! This is something I can definitely help with.\n\n**Quick Summary:**\n- The approach depends on your specific use case\n- There are tradeoffs to consider\n- I'll walk you through the options\n\nLet me know if you'd like more details on any particular aspect.",
];
