import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeAdapter {
  subscribe(channel: string, event: string, callback: (payload: any) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  publish(channel: string, event: string, payload: any): Promise<void>;
}

export class SupabaseRealtimeAdapter implements RealtimeAdapter {
  private client: SupabaseClient;
  private channels: Map<string, RealtimeChannel>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = new SupabaseClient(supabaseUrl, supabaseKey);
    this.channels = new Map();
  }

  async subscribe(channel: string, event: string, callback: (payload: any) => void): Promise<void> {
    if (this.channels.has(channel)) {
      return;
    }

    const realtimeChannel = this.client
      .channel(channel)
      .on('postgres_changes', {
        event,
        schema: 'public'
      }, callback)
      .subscribe();

    this.channels.set(channel, realtimeChannel);
  }

  async unsubscribe(channel: string): Promise<void> {
    const realtimeChannel = this.channels.get(channel);
    if (realtimeChannel) {
      await realtimeChannel.unsubscribe();
      this.channels.delete(channel);
    }
  }

  async publish(channel: string, event: string, payload: any): Promise<void> {
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
  async subscribeToUserUpdates(userId: string, callback: (payload: any) => void): Promise<void> {
    await this.subscribe(
      `user_updates_${userId}`,
      'UPDATE',
      callback
    );
  }

  async subscribeToTransactions(userId: string, callback: (payload: any) => void): Promise<void> {
    await this.subscribe(
      `transactions_${userId}`,
      'INSERT',
      callback
    );
  }

  async subscribeToDocumentVerification(userId: string, callback: (payload: any) => void): Promise<void> {
    await this.subscribe(
      `document_verification_${userId}`,
      'UPDATE',
      callback
    );
  }
}
