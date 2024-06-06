import { Repository } from 'typeorm';
import { Item } from '../data/entities/Item';
import { AppDataSource } from '../data/AppDataSource';

// Define the custom repository interface
export interface ItemRepository extends Repository<Item> {
    findByName(name: string): Promise<Item | null>;
}

// Create a separate instance of Repository<Item>
const baseItemRepository = AppDataSource.getRepository(Item);

// Extend the base repository with custom methods
const itemRepository: ItemRepository = Object.assign(baseItemRepository, {
    async findByName(name: string): Promise<Item | null> {
        // const item = await baseItemRepository.findOne({ where: { name } });
        // return item || null;

        return baseItemRepository.createQueryBuilder("item")
        .where("item.name = :name", { name })
        .getOne();
    }
});

export { itemRepository };
