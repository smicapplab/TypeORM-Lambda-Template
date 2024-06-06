import { ItemRepository, itemRepository } from '../repositories/ItemRepository';
import { Item } from '../data/entities/Item';

export class ItemService {
  private readonly itemRepository: ItemRepository;

  constructor() {
    this.itemRepository = itemRepository;
  }

  async getItems(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async addItem(name: string): Promise<Item> {
    const newItem = this.itemRepository.create({
      id: 1,
      name
    });
    return this.itemRepository.save(newItem);
  }

  async getItemByName(name: string): Promise<Item | null> {
    return this.itemRepository.findByName(name);
}
}
