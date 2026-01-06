/**
 * JobQueue
 * Minimal in-memory queue with pluggable processor. Designed to swap to Bull/BullMQ later.
 */

import { Logger } from '../utils/logger';

export interface Job<T = any> {
  id: string;
  name: string;
  payload: T;
  attempts?: number;
}

type Processor<T> = (job: Job<T>) => Promise<void>;

class JobQueue<T = any> {
  private queue: Job<T>[] = [];
  private processing = false;
  private processor: Processor<T> | null = null;
  private logger = new Logger('JobQueue');

  setProcessor(fn: Processor<T>): void {
    this.processor = fn;
    this.run();
  }

  enqueue(job: Job<T>): void {
    this.queue.push(job);
    this.run();
  }

  size(): number {
    return this.queue.length;
  }

  private async run(): Promise<void> {
    if (this.processing || !this.processor) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await this.processor(job);
      } catch (err: any) {
        this.logger.warn(`Job failed: ${job.name}`, err?.message || err);
        const attempts = job.attempts || 0;
        if (attempts < 3) {
          this.enqueue({ ...job, attempts: attempts + 1 });
        }
      }
    }

    this.processing = false;
  }
}

export const backgroundQueue = new JobQueue<any>();
export default JobQueue;
