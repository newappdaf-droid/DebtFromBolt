// Chat API Layer for real-time messaging
import { supabase } from '@/integrations/supabase/client';
import { USE_MOCK } from '@/lib/api';
import { 
  Conversation, 
  ConversationParticipant, 
  ChatMessage, 
  CreateConversationRequest, 
  CreateMessageRequest,
  ConversationType,
  MessageType,
  UserRole
} from '@/types';

// Mock data for conversations and messages
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Case Discussion - Smith vs. ABC Corp',
    type: 'case' as ConversationType,
    caseId: '550e8400-e29b-41d4-a716-446655440004',
    isClientVisible: true,
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    participants: [
      {
        id: 'part-1',
        conversationId: 'conv-1',
        userId: 'user-1',
        userName: 'Agent Smith',
        userRole: 'AGENT' as UserRole,
        joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastReadAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    lastMessage: {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'Agent Smith',
      content: 'Case review completed. Ready for next steps.',
      messageType: 'text' as MessageType,
      isInternal: false,
      attachmentUrl: null,
      attachmentName: null,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  }
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    senderName: 'Agent Smith',
    content: 'Case review completed. Ready for next steps.',
    messageType: 'text' as MessageType,
    isInternal: false,
    attachmentUrl: null,
    attachmentName: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-2',
    senderName: 'Client Johnson',
    content: 'Thank you for the update. When can we expect the next communication?',
    messageType: 'text' as MessageType,
    isInternal: false,
    attachmentUrl: null,
    attachmentName: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

export class ChatApi {
  // Get conversations for current user
  async getConversations(): Promise<Conversation[]> {
    if (USE_MOCK) {
      return Promise.resolve(MOCK_CONVERSATIONS);
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(*),
        lastMessage:messages(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return conversations?.map(conv => ({
      id: conv.id,
      title: conv.title,
      type: conv.type as ConversationType,
      caseId: conv.case_id,
      isClientVisible: conv.is_client_visible,
      createdBy: conv.created_by,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      participants: conv.participants?.map((p: any) => ({
        id: p.id,
        conversationId: p.conversation_id,
        userId: p.user_id,
        userName: p.user_name,
        userRole: p.user_role as UserRole,
        joinedAt: p.joined_at,
        lastReadAt: p.last_read_at
      })),
      lastMessage: conv.lastMessage?.[0] ? {
        id: conv.lastMessage[0].id,
        conversationId: conv.lastMessage[0].conversation_id,
        senderId: conv.lastMessage[0].sender_id,
        senderName: conv.lastMessage[0].sender_name,
        content: conv.lastMessage[0].content,
        messageType: conv.lastMessage[0].message_type as MessageType,
        isInternal: conv.lastMessage[0].is_internal,
        attachmentUrl: conv.lastMessage[0].attachment_url,
        attachmentName: conv.lastMessage[0].attachment_name,
        createdAt: conv.lastMessage[0].created_at,
        updatedAt: conv.lastMessage[0].updated_at
      } : undefined
    })) || [];
  }

  // Get conversation by ID
  async getConversation(id: string): Promise<Conversation | null> {
    if (USE_MOCK) {
      return Promise.resolve(MOCK_CONVERSATIONS.find(c => c.id === id) || null);
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return data ? {
      id: data.id,
      title: data.title,
      type: data.type as ConversationType,
      caseId: data.case_id,
      isClientVisible: data.is_client_visible,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      participants: data.participants?.map((p: any) => ({
        id: p.id,
        conversationId: p.conversation_id,
        userId: p.user_id,
        userName: p.user_name,
        userRole: p.user_role as UserRole,
        joinedAt: p.joined_at,
        lastReadAt: p.last_read_at
      }))
    } : null;
  }

  // Get case conversations
  async getCaseConversations(caseId: string): Promise<Conversation[]> {
    if (USE_MOCK) {
      return Promise.resolve(MOCK_CONVERSATIONS.filter(c => c.caseId === caseId));
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(*),
        lastMessage:messages(*)
      `)
      .eq('case_id', caseId)
      .eq('type', 'case')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return conversations?.map(conv => ({
      id: conv.id,
      title: conv.title,
      type: conv.type as ConversationType,
      caseId: conv.case_id,
      isClientVisible: conv.is_client_visible,
      createdBy: conv.created_by,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      participants: conv.participants?.map((p: any) => ({
        id: p.id,
        conversationId: p.conversation_id,
        userId: p.user_id,
        userName: p.user_name,
        userRole: p.user_role as UserRole,
        joinedAt: p.joined_at,
        lastReadAt: p.last_read_at
      })),
      lastMessage: conv.lastMessage?.[0] ? {
        id: conv.lastMessage[0].id,
        conversationId: conv.lastMessage[0].conversation_id,
        senderId: conv.lastMessage[0].sender_id,
        senderName: conv.lastMessage[0].sender_name,
        content: conv.lastMessage[0].content,
        messageType: conv.lastMessage[0].message_type as MessageType,
        isInternal: conv.lastMessage[0].is_internal,
        attachmentUrl: conv.lastMessage[0].attachment_url,
        attachmentName: conv.lastMessage[0].attachment_name,
        createdAt: conv.lastMessage[0].created_at,
        updatedAt: conv.lastMessage[0].updated_at
      } : undefined
    })) || [];
  }

  // Create new conversation
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    if (USE_MOCK) {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: request.title,
        type: request.type,
        caseId: request.caseId,
        isClientVisible: request.isClientVisible,
        createdBy: 'mock-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MOCK_CONVERSATIONS.push(newConversation);
      return Promise.resolve(newConversation);
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        title: request.title,
        type: request.type,
        case_id: request.caseId,
        is_client_visible: request.isClientVisible,
        created_by: user.user.id
      })
      .select()
      .single();

    if (convError) throw convError;

    // Add participants (including creator)
    const participants = [...new Set([user.user.id, ...request.participantIds])];
    
    const participantData = await Promise.all(
      participants.map(async (userId) => {
        // Get user info (in real app, this would come from a profiles table)
        return {
          conversation_id: conversation.id,
          user_id: userId,
          user_name: `User ${userId}`, // This should be fetched from user profiles
          user_role: 'AGENT' as UserRole // This should be fetched from user profiles
        };
      })
    );

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantData);

    if (participantError) throw participantError;

    return {
      id: conversation.id,
      title: conversation.title,
      type: conversation.type as ConversationType,
      caseId: conversation.case_id,
      isClientVisible: conversation.is_client_visible,
      createdBy: conversation.created_by,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at
    };
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, limit = 50): Promise<ChatMessage[]> {
    if (USE_MOCK) {
      return Promise.resolve(MOCK_MESSAGES.filter(m => m.conversationId === conversationId));
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data?.reverse().map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      content: msg.content,
      messageType: msg.message_type as MessageType,
      isInternal: msg.is_internal,
      attachmentUrl: msg.attachment_url,
      attachmentName: msg.attachment_name,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at
    })) || [];
  }

  // Send message
  async sendMessage(request: CreateMessageRequest): Promise<ChatMessage> {
    if (USE_MOCK) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: request.conversationId,
        senderId: 'mock-user',
        senderName: 'Mock User',
        content: request.content,
        messageType: request.messageType || 'text',
        isInternal: request.isInternal || false,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MOCK_MESSAGES.push(newMessage);
      return Promise.resolve(newMessage);
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: request.conversationId,
        sender_id: user.user.id,
        sender_name: user.user.email || 'Unknown User', // Should use proper user profile
        content: request.content,
        message_type: request.messageType || 'text',
        is_internal: request.isInternal || false
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', request.conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      content: data.content,
      messageType: data.message_type as MessageType,
      isInternal: data.is_internal,
      attachmentUrl: data.attachment_url,
      attachmentName: data.attachment_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Add participant to conversation
  async addParticipant(conversationId: string, userId: string, userName: string, userRole: UserRole): Promise<void> {
    if (USE_MOCK) {
      return Promise.resolve();
    }

    const { error } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        user_name: userName,
        user_role: userRole
      });

    if (error) throw error;
  }

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    if (USE_MOCK) {
      return Promise.resolve();
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return;

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  // Subscribe to conversation messages
  subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void) {
    if (USE_MOCK) {
      // Return a mock subscription that does nothing
      return {
        unsubscribe: () => Promise.resolve({ error: null })
      };
    }

    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }

  // Subscribe to conversations list
  subscribeToConversations(callback: (conversation: Conversation) => void) {
    if (USE_MOCK) {
      // Return a mock subscription that does nothing
      return {
        unsubscribe: () => Promise.resolve({ error: null })
      };
    }

    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          callback(payload.new as Conversation);
        }
      )
      .subscribe();
  }
}

export const chatApi = new ChatApi();