import { Logger } from './logger';

export class LogManager {
  private static instance: LogManager;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('wechat-notion-exporter');
  }

  public static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  public logRunStart(url: string): void {
    this.logger.info('RUN_START', {
      timestamp: new Date().toISOString(),
      url: url,
      status: 'started'
    });
  }

  public logRunSuccess(url: string, result: any): void {
    this.logger.info('RUN_SUCCESS', {
      timestamp: new Date().toISOString(),
      url: url,
      status: 'success',
      articleTitle: result.title,
      imageCount: result.images?.length || 0,
      notionPageId: result.notionPageId,
      htmlFilePath: result.htmlFilePath
    });
  }

  public logRunError(url: string, error: Error): void {
    this.logger.error('RUN_ERROR', {
      timestamp: new Date().toISOString(),
      url: url,
      status: 'failed',
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error.constructor.name
    });
  }

  public logStep(step: string, details: any): void {
    this.logger.debug('STEP_PROGRESS', {
      timestamp: new Date().toISOString(),
      step: step,
      details: details
    });
  }
}