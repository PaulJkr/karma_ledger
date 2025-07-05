import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { QueueNames } from 'src/config/queues';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from './gemini.service';
import { KarmaEventService } from './karma_event.service';
import { handleError } from 'src/util/error';

interface JobData {
  userId: string;
  karmaEventId: string;
  action: string;
}

@Processor(QueueNames.KARMA_FEEDBACK)
export class KarmaFeedbackProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger('KarmaFeedbackProcessor');
  constructor(
    private readonly AiService: AiService,
    private readonly karmaService: KarmaEventService,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    const { userId, karmaEventId, action } = job.data;

    try {
      const processedData = await this.AiService.processKarmaAction({
        userId,
        karmaEventId,
        action,
      });
      this.logger.log(`event id was ${karmaEventId}`);
      await this.karmaService.updateKarmaEvent(karmaEventId, processedData);
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed with error: ${handleError(error)}`,
      );
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JobData>) {
    this.logger.log(
      `Job ${job.id} completed successfully: (action: ${job.data.action})`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<JobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
  }
}
