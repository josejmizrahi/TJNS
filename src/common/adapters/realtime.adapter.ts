import { SupabaseClient, RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST';
export type RealtimePresenceState = { [key: string]: { online_at: string; user_id: string } };

export interface RealtimeAdapter {
  subscribeToChanges<T = unknown>(
    table: string,
    event: RealtimeEventType,
    callback: (payload: RealtimePostgresChangesPayload<T>) => void
  ): Promise<void>;
  subscribeToPresence(
    channel: string,
    callback: (state: RealtimePresenceState) => void
  ): Promise<void>;
  subscribeToBroadcast<T = unknown>(
    channel: string,
    event: string,
    callback: (payload: T) => void
  ): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  publish<T = unknown>(channel: string, event: string, payload: T): Promise<void>;
  track(channel: string, presence: { user_id: string }): Promise<void>;
}

export class SupabaseRealtimeAdapter implements RealtimeAdapter {
  private client: SupabaseClient;
  private channels: Map<string, RealtimeChannel>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = new SupabaseClient(supabaseUrl, supabaseKey);
    this.channels = new Map();
  }

  async subscribeToChanges<T = unknown>(
    table: string,
    event: RealtimeEventType,
    callback: (payload: RealtimePostgresChangesPayload<T>) => void
  ): Promise<void> {
    const channel = `db_changes:${table}`;
    if (this.channels.has(channel)) {
      return;
    }

    const realtimeChannel = this.client
      .channel(channel)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table
        },
        callback
      )
      .subscribe();

    this.channels.set(channel, realtimeChannel);
  }

  async subscribeToPresence(
    channel: string,
    callback: (state: RealtimePresenceState) => void
  ): Promise<void> {
    if (this.channels.has(channel)) {
      return;
    }

    const realtimeChannel = this.client
      .channel(channel)
      .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        callback(state as RealtimePresenceState);
      })
      .subscribe();

    this.channels.set(channel, realtimeChannel);
  }

  async subscribeToBroadcast<T = unknown>(
    channel: string,
    event: string,
    callback: (payload: T) => void
  ): Promise<void> {
    if (this.channels.has(channel)) {
      return;
    }

    const realtimeChannel = this.client
      .channel(channel)
      .on(
        'broadcast',
        { event },
        ({ payload }) => callback(payload as T)
      )
      .subscribe();

    this.channels.set(channel, realtimeChannel);
  }

  async track(channel: string, presence: { user_id: string }): Promise<void> {
    const realtimeChannel = this.channels.get(channel);
    if (realtimeChannel) {
      await realtimeChannel.track(presence);
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    const realtimeChannel = this.channels.get(channel);
    if (realtimeChannel) {
      await realtimeChannel.unsubscribe();
      this.channels.delete(channel);
    }
  }

  async publish<T = unknown>(channel: string, event: string, payload: T): Promise<void> {
    const realtimeChannel = this.channels.get(channel);
    if (realtimeChannel) {
      await realtimeChannel.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }

  // Helper methods for specific use cases
  async subscribeToUserUpdates(userId: string, callback: (payload: RealtimePostgresChangesPayload<User>) => void): Promise<void> {
    await this.subscribeToChanges(
      'user_profiles',
      'UPDATE',
      (payload) => {
        if (payload.new.id === userId) {
          callback(payload);
        }
      }
    );
  }

  async subscribeToTransactions(userId: string, callback: (payload: RealtimePostgresChangesPayload<Transaction>) => void): Promise<void> {
    await this.subscribeToChanges(
      'transactions',
      'INSERT',
      (payload) => {
        if (payload.new.fromUserId === userId || payload.new.toUserId === userId) {
          callback(payload);
        }
      }
    );
  }

  async subscribeToDocumentVerification(userId: string, callback: (payload: RealtimePostgresChangesPayload<KYCDocument>) => void): Promise<void> {
    await this.subscribeToChanges(
      'kyc_documents',
      'UPDATE',
      (payload) => {
        if (payload.new.userId === userId) {
          callback(payload);
        }
      }
    );
  }

  async subscribeToOnlineUsers(callback: (state: RealtimePresenceState) => void): Promise<void> {
    await this.subscribeToPresence('online_users', callback);
  }
}
