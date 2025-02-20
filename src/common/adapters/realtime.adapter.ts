import { SupabaseClient, RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | 'BROADCAST';
export type RealtimePresenceState = { [key: string]: { online_at: string; user_id: string } };

export interface RealtimeAdapter {
  subscribeToChanges<T extends Record<string, unknown>>(
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

  async subscribeToChanges<T extends Record<string, unknown>>(
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
      .on('system', { event: 'postgres_changes' }, () => {})
      .on('broadcast', { event: 'postgres_changes' }, () => {})
      .on('presence', { event: 'sync' }, () => {})
      .on('system', {
        event: event as 'INSERT' | 'UPDATE' | 'DELETE',
        schema: 'public',
        table
      },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new && typeof payload.new === 'object') {
            callback(payload);
          }
        }
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
        callback(state as unknown as RealtimePresenceState);
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
  async subscribeToUserUpdates(userId: string, callback: (payload: RealtimePostgresChangesPayload<{ id: string }>) => void): Promise<void> {
    await this.subscribeToChanges<{ id: string }>(
      'user_profiles',
      'UPDATE',
      (payload) => {
        const newData = payload.new as { id: string };
        if (newData && newData.id === userId) {
          callback(payload);
        }
      }
    );
  }

  async subscribeToTransactions(userId: string, callback: (payload: RealtimePostgresChangesPayload<{ fromUserId: string; toUserId: string }>) => void): Promise<void> {
    await this.subscribeToChanges<{ fromUserId: string; toUserId: string }>(
      'transactions',
      'INSERT',
      (payload) => {
        const newData = payload.new as { fromUserId: string; toUserId: string };
        if (newData && (newData.fromUserId === userId || newData.toUserId === userId)) {
          callback(payload);
        }
      }
    );
  }

  async subscribeToDocumentVerification(userId: string, callback: (payload: RealtimePostgresChangesPayload<{ userId: string }>) => void): Promise<void> {
    await this.subscribeToChanges<{ userId: string }>(
      'kyc_documents',
      'UPDATE',
      (payload) => {
        const newData = payload.new as { userId: string };
        if (newData && newData.userId === userId) {
          callback(payload);
        }
      }
    );
  }

  async subscribeToOnlineUsers(callback: (state: RealtimePresenceState) => void): Promise<void> {
    await this.subscribeToPresence('online_users', callback);
  }
}
