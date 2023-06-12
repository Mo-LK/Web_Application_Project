/* eslint-disable */
import { Card } from '@common/card';
import { GameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { Server } from 'socket.io';
import { CardsManagerGateway } from './cards-manager.gateway';

describe('CardsManagerGateway', () => {
  let gateway: CardsManagerGateway;
  let server: sinon.SinonStubbedInstance<Server>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsManagerGateway],
    }).compile();

    gateway = module.get<CardsManagerGateway>(CardsManagerGateway);
    server = sinon.createStubInstance<Server>(Server);
    gateway = module.get<CardsManagerGateway>(CardsManagerGateway);
    gateway['serverSocket'] = server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('handleDeletedCard should emit cardDeleted event', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.handleDeletedCard('cardId', 1);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('cardDeleted', 'cardId');
  });

  it('handleCreatedCard should emit cardCreated event', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.handleCreatedCard({cardId: "1"} as unknown as Card);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('cardCreated', JSON.stringify({cardId: "1"}));
  });

  it('handleStatChanged should emit statsChanged event', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.handleStatChanged({cardId: "1"} as unknown as Card);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('statsChanged', JSON.stringify({cardId: "1"}));
  });

  it('handleConstantChanged should emit constantsChanged event', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.handleConstantChanged({} as GameConstants);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('constantsChanged', JSON.stringify({}));
  });

  it('handleLimitedModeEnable should emit limitedModeEnable event with correct boolean value', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.handleLimitedModeEnable(1);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('limitedModeEnable', JSON.stringify(true));
    gateway.handleLimitedModeEnable(0);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('limitedModeEnable', JSON.stringify(false));
  });

  it('handleLimitedModeEnable should emit limitedModeEnable event with correct boolean value', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.handleLimitedModeEnable(1);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('limitedModeEnable', JSON.stringify(true));
    gateway.handleLimitedModeEnable(0);
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('limitedModeEnable', JSON.stringify(false));
  });

  it('handleStatChanged should emit statsChanged event', () => {
    jest.spyOn(gateway['serverSocket'], 'emit').mockImplementation(()=>true);
    gateway.notifyResetHistory();
    expect(gateway['serverSocket'].emit).toHaveBeenCalledWith('resetHistory');
  });
});
