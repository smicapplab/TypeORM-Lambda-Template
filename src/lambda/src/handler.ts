import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { AppDataSource } from './data/AppDataSource';
import { ItemService } from './services/ItemService';

const itemService = new ItemService();

export const main = async (event: APIGatewayProxyEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false;


    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
    
      const request = JSON.parse(event.body || '{}');
      const { fieldName, arguments: args } = request;
    
      switch (fieldName) {
        case 'getItems':
          return await itemService.getItems();
        case 'addItem':
          return await itemService.addItem(args.name);
        default:
          return null;
      }
};