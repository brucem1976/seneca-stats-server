import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SenecaStatsService from '../lib/seneca_stats_service-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SenecaStatsService.SenecaStatsServiceStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT));
});
