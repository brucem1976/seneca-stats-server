import * as cdk from '@aws-cdk/core';
import * as stats_service from '../lib/stats_service';

export class SenecaStatsServiceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new stats_service.StatsService(this, 'stats');
  }
}
