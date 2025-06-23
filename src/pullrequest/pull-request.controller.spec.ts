import { Test, TestingModule } from '@nestjs/testing';
import { PullrequestController } from './pull-request.controller';
import { PullrequestService } from './pull-request.service';

describe('PullrequestController', () => {
  let controller: PullrequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PullrequestController],
      providers: [PullrequestService],
    }).compile();

    controller = module.get<PullrequestController>(PullrequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
